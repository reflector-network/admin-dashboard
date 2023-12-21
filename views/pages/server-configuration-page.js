import React, {useCallback, useEffect, useState} from 'react'
import {Button} from '@stellar-expert/ui-framework'
import {getCurrentConfig, postApi} from '../../api/interface'
import clientStatus from '../../state/client-status'
import invocationFormatter from '../util/invocation-formatter'

export default function ServerConfigurationPage() {
    const [configuration, setConfiguration] = useState({})
    const [configProperties, setConfigProperties] = useState('')
    const [inProgress, setInProgress] = useState(false)
    const [isValid, setIsValid] = useState(false)

    useEffect(() => {
        getCurrentConfig()
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                setConfigProperties(invocationFormatter(res.currentConfig.config || {}, 1))
                setConfiguration(res.currentConfig.config)
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to get configuration'}))
    }, [])

    const changeConfig = useCallback(e => {
        const val = e.target.value
        setConfigProperties(val)
        try {
            const pureConfig = JSON.parse(val.replaceAll("'",'"'))
            setConfiguration(pureConfig)
            setIsValid(true)
        } catch (e) {
            console.error(e)
            setIsValid(false)
        }
    }, [])

    const submitUpdates = useCallback(async () => {
        setInProgress(true)
        const signature = await clientStatus.createSignature(configuration.config)

        postApi('config', {
            ...configuration,
            signatures: [signature]
        })
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                notify({type: 'success', message: 'Update submited'})
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to update data'}))
            .finally(() => setInProgress(false))
    }, [configuration])

    return <div className="segment blank">
        <h3>Quorum configuration file</h3>
        <hr className="flare"/>
        <div className="space">
            <textarea className="result" style={{height: '75vh'}}
                      value={configProperties} onChange={changeConfig}/>
        </div>
        <div className="space row">
            <div className="column column-75 text-center">
                {!!inProgress && <>
                    <div className="loader inline"/>
                    <span className="dimmed text-small"> In progress...</span>
                </>}
            </div>
            <div className="column column-25">
                <Button block disabled={!isValid || inProgress} onClick={submitUpdates}>Submit</Button>
            </div>
        </div>
    </div>
}