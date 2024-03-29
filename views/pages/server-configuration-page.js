import React, {useCallback, useEffect, useState} from 'react'
import {Button, UtcTimestamp} from '@stellar-expert/ui-framework'
import {getCurrentConfig, postApi} from '../../api/interface'
import clientStatus from '../../state/client-status'
import invocationFormatter from '../util/invocation-formatter'

function validation(configuration) {
    if (isNaN(parseInt(configuration.timestamp, 10)) || !configuration.expirationDate || !configuration.config)
        return
    return true
}

export default function ServerConfigurationPage() {
    const [configuration, setConfiguration] = useState({})
    const [configProperties, setConfigProperties] = useState('')
    const [inProgress, setInProgress] = useState(false)
    const [isValid, setIsValid] = useState(false)
    const [isValidTime, setIsValidTime] = useState(false)

    const validateTime = useCallback(time => {
        try {
            setIsValidTime(!!new Date(time).getTime())
        } catch (err) {
            setIsValidTime(false)
        }
    }, [])

    useEffect(() => {
        getCurrentConfig()
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                const config = res.currentConfig?.config.config
                setConfigProperties(invocationFormatter(config || {}, 1))
                setConfiguration({
                    timestamp: 0,
                    expirationDate: 0,
                    description: '',
                    config
                })
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to get configuration'}))
    }, [])

    const changeConfig = useCallback(e => {
        const val = e.target.value
        setConfigProperties(val)
        try {
            const pureConfig = JSON.parse(val.replaceAll("'",'"'))
            setConfiguration(prev => {
                const configuration = {...prev, config: pureConfig}
                setIsValid(validation(configuration))
                return configuration
            })
        } catch (e) {
            console.error(e)
            setConfiguration(prev => ({...prev, config: null}))
            setIsValid(false)
        }
    }, [])

    const changeTimestamp = useCallback(e => {
        const timestamp = parseInt(e.target.value, 10) || 0
        setConfiguration(prev => {
            const configuration = {...prev, timestamp}
            setIsValid(validation(configuration))
            return configuration
        })
        validateTime(timestamp)
    }, [validateTime])

    const changeExpirationDate = useCallback(e => {
        const expirationDate = parseInt(e.target.value, 10) || 0
        setConfiguration(prev => {
            const configuration = {...prev, expirationDate}
            setIsValid(validation(configuration))
            return configuration
        })
        validateTime(expirationDate)
    }, [validateTime])

    const changeDescription = useCallback(e => {
        setConfiguration(prev => ({...prev, description: e.target.value}))
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
                notify({type: 'success', message: 'Update submitted'})
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to update data'}))
            .finally(() => setInProgress(false))
    }, [configuration])

    return <div className="segment blank">
        <h3>Quorum configuration file</h3>
        <hr className="flare"/>
        <div className="row">
            <div className="column column-50">
                <div className="space"/>
                <label>Timestamp</label>
                <input value={configuration.timestamp} onChange={changeTimestamp}/>
                {(!!isValidTime && !!configuration.timestamp) && <div className="dimmed text-tiny">
                    (<UtcTimestamp date={configuration.timestamp}/>)
                </div>}
            </div>
            <div className="column column-50">
                <div className="space"/>
                <label>Expiration date</label>
                <input value={configuration.expirationDate} onChange={changeExpirationDate}/>
                {(!!isValidTime && !!configuration.expirationDate) && <div className="dimmed text-tiny">
                    (<UtcTimestamp date={configuration.expirationDate}/>)
                </div>}
            </div>
        </div>
        <div className="space">
            <label>Description</label>
            <textarea value={configuration.description || ''} onChange={changeDescription}
                      placeholder="Information about configuration update"/>
        </div>
        <div className="space">
            <label>Config</label>
            <textarea style={{height: '75vh'}} value={configProperties} onChange={changeConfig}
                      placeholder="Set up configuration"/>
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