import React, {useCallback, useEffect, useState} from 'react'
import {StrKey} from 'stellar-sdk'
import {Button, CodeBlock} from '@stellar-expert/ui-framework'
import {navigation} from '@stellar-expert/navigation'
import {getConfigRequirements, postApi} from '../../api/interface'
import invocationFormatter from '../util/invocation-formatter'
import parseExternalUpdateRequest from '../util/external-update-request-parser'

export default function ServerConfigurationPage() {
    const updateData = parseExternalUpdateRequest()
    const [config, setConfig] = useState({})
    const [isDbConnectionStringRequired, setIsDbConnectionStringRequired] = useState(true)
    const [inProgress, setInProgress] = useState(false)
    const [isValid, setIsValid] = useState(false)
    const onlyReadFormatted = invocationFormatter(updateData || {}, 1)

    useEffect(() => {
        getConfigRequirements()
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                setIsDbConnectionStringRequired(res.isDbConnectionStringRequired)
            })
            .catch((error) => {
                notify({type: 'error', message: error?.message || "Node is already configured"})
                navigation.navigate('/')
            })
    }, [])

    const configValidation = useCallback(val => {
        if (!StrKey.isValidEd25519SecretSeed(val.secret))
            return
        if (isDbConnectionStringRequired) {
            return !!val.dbConnectionString?.length
        }
        return true
    }, [isDbConnectionStringRequired])

    const updateSecret = useCallback(e => {
        const val = e.target.value.toUpperCase()
        setConfig(prev => {
            const res = {...prev, secret: val}
            setIsValid(configValidation(res))
            return res
        })
    }, [configValidation])

    const updateConnection = useCallback(e => {
        const val = e.target.value
        setConfig(prev => {
            const res = {...prev, dbConnectionString: val}
            setIsValid(configValidation(res))
            return res
        })
    }, [configValidation])

    const submitUpdates = useCallback(() => {
        setInProgress(true)
        const updateConfigData = {...config, ...updateData}
        postApi('config', updateConfigData)
            .then(() => {
                notify({type: 'success', message: 'Config updated'})
                navigation.navigate('/')
            })
            .catch(({error}) => notify({type: 'error', message: error?.message || "Failed to update data"}))
            .finally(() => setInProgress(false))
    }, [updateData, config])

    return <div className="segment blank">
        <h3>Update config</h3>
        <hr className="flare"/>
        <div className="space">
            <b>Secret key</b>
            <input type="text" className="micro-space" placeholder="Secret key starting with 'S', like 'SAK4...2PLT'"
                   value={config.secret || ''} onChange={updateSecret}/>
        </div>
        <div className="space">
            <b>Connection to database</b>
            <input type="text" className="micro-space"
                   placeholder={isDbConnectionStringRequired ? "String of connection" : "Managed by docker"}
                   value={config.dbConnectionString || ''} onChange={updateConnection}/>
        </div>
        <CodeBlock className="result" style={{height: '40vh'}} lang="js">{onlyReadFormatted}</CodeBlock>
        <div className="space row">
            <div className="column column-66 text-center">
                {!!inProgress && <>
                    <div className="loader inline"/>
                    <span className="dimmed text-small"> In progress...</span>
                </>}
            </div>
            <div className="column column-33">
                <Button block disabled={!isValid || inProgress} onClick={submitUpdates}>Submit</Button>
            </div>
        </div>
    </div>
}
