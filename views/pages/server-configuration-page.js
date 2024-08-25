import React, {useCallback, useEffect, useState} from 'react'
import {Button, DateSelector} from '@stellar-expert/ui-framework'
import {normalizeDate} from '@stellar-expert/formatter/src/timestamp-format'
import {getCurrentConfig, postApi} from '../../api/interface'
import {ManualDate, maxDateUpdate, maxExpirationDate, minDateUpdate} from "../server-config/action-form-confirmation-view"
import clientStatus from '../../state/client-status'
import invocationFormatter from '../util/invocation-formatter'

function validation({timestamp, expirationDate, config}) {
    if (isNaN(parseInt(timestamp, 10)) || !expirationDate || !config)
        return
    return true
}

export default function ServerConfigurationPage() {
    const [configuration, setConfiguration] = useState({})
    const [configProperties, setConfigProperties] = useState('')
    const [inProgress, setInProgress] = useState(false)
    const [isValid, setIsValid] = useState(false)
    const [isOpenTimestamp, setIsOpenTimestamp] = useState(false)
    const [allowEarlySubmission, setAllowEarlySubmission] = useState(false)

    const toggleAllowEarlySubmission = useCallback(() => setAllowEarlySubmission(prev => !prev), [])
    const toggleTimestamp = useCallback(() => setIsOpenTimestamp(prev => !prev), [])

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
            notify({type: 'error', message: e.error?.message || 'Failed to parse configuration'})
            setConfiguration(prev => ({...prev, config: null}))
            setIsValid(false)
        }
    }, [])

    const changeTimestamp = useCallback(val => {
        const timestamp = new Date(normalizeDate(val || 0)).getTime()
        setConfiguration(prev => {
            const configuration = {...prev, timestamp: val ? timestamp : 0}
            setIsValid(validation(configuration))
            return configuration
        })
    }, [])

    const clearTime = useCallback(() => {
        changeTimestamp(0)
        setIsOpenTimestamp(false)
    }, [changeTimestamp, setIsOpenTimestamp])

    const changeExpirationDate = useCallback(val => {
        const expirationDate = new Date(normalizeDate(val || 0)).getTime()
        setConfiguration(prev => {
            const configuration = {...prev, expirationDate}
            setIsValid(validation(configuration))
            return configuration
        })
    }, [])

    const changeDescription = useCallback(e => {
        setConfiguration(prev => ({...prev, description: e.target.value}))
    }, [])

    const submitUpdates = useCallback(async () => {
        setInProgress(true)
        const signature = await clientStatus.createSignature(configuration.config)

        postApi('config', {
            ...configuration,
            allowEarlySubmission,
            signatures: [signature]
        })
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                notify({type: 'success', message: 'Update submitted'})
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to update data'}))
            .finally(() => setInProgress(false))
    }, [configuration, allowEarlySubmission])

    return <div className="segment blank">
        <h3>Quorum configuration file</h3>
        <hr className="flare"/>
        <div className="row">
            <div className="column column-50">
                <div className="space"/>
                <label>Timestamp</label>
                {!!isOpenTimestamp && <>
                    <DateSelector value={configuration.timestamp} onChange={changeTimestamp}
                                  min={minDateUpdate} max={maxDateUpdate} className="micro-space" style={{'width': '13em'}}/>
                    <a className="icon-cancel" onClick={clearTime}/></>}
                {!isOpenTimestamp && <ManualDate onChange={toggleTimestamp}/>}
            </div>
            <div className="column column-50">
                <div className="space"/>
                <label>Expiration date</label>
                <DateSelector value={configuration.expirationDate} onChange={changeExpirationDate}
                              min={maxDateUpdate} max={maxExpirationDate} className="micro-space" style={{'width': '13em'}}/>
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
            <div className="column column-75">
                <label className="micro-space">
                    <input onChange={toggleAllowEarlySubmission} type="checkbox" checked={allowEarlySubmission}/>&nbsp;
                    Submit when all ready
                </label>
            </div>
            <div className="column column-25">
                <Button block disabled={!isValid || inProgress} onClick={submitUpdates}>Submit</Button>
            </div>
        </div>
    </div>
}