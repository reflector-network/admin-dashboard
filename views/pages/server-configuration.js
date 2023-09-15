import React, {useCallback, useEffect, useState} from 'react'
import {StrKey} from 'stellar-sdk'
import {Button, CodeBlock} from '@stellar-expert/ui-framework'
import {navigation} from '@stellar-expert/navigation'
import updateRequest from '../../state/config-update-request'
import {getConfigRequirements, postApi} from '../../api/interface'
import invocationFormatter from '../util/invocation-formatter'

export default function ServerConfigurationPage() {
    const updateData = updateRequest.externalRequest
    const [config, setConfig] = useState({})
    const [isDbConnectionStringRequired, setIsDbConnectionStringRequired] = useState(true)
    const [inProgress, setInProgress] = useState(false)
    const [isValid, setIsValid] = useState(false)
    const readonlyConfigProperties = invocationFormatter(updateData || {}, 1)

    useEffect(() => {
        getConfigRequirements()
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                setIsDbConnectionStringRequired(res.isDbConnectionStringRequired)
            })
            .catch((error) => {
                notify({type: 'error', message: error?.message || 'Node is already configured'})
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
            .catch(({error}) => notify({type: 'error', message: error?.message || 'Failed to update data'}))
            .finally(() => setInProgress(false))
    }, [updateData, config])

    return <div className="segment blank">
        <h3>Initial node configuration</h3>
        <hr className="flare"/>
        <div className="space">
            <label>Node secret key<br/>
                <span className="dimmed text-tiny">(Secret key used to identify your node and sign price update transactions on behalf of your node)</span>
                <input type="text" className="micro-space" placeholder="Secret key starting with 'S', like 'SAK4...2PLT'"
                       value={config.secret || ''} onChange={updateSecret}/>
            </label>
        </div>
        <div className="space">
            <label>Database connection string<br/>
                <span className="dimmed text-tiny">(Connection string to the StellarCore database, skip if you run the bundled Docker image)</span>
                <input type="text" className="micro-space" value={config.dbConnectionString || ''} onChange={updateConnection}
                       placeholder={isDbConnectionStringRequired ? 'E.g. postgresql://user:password@address:port/dbname' : '(Current connection string is managed by Docker image)'}/>
            </label>
        </div>
        <h3 className="double-space">Quorum configuration file</h3>
        <CodeBlock className="result" style={{height: '40vh'}} lang="js">{readonlyConfigProperties}</CodeBlock>
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
