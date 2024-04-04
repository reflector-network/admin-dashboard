import React, {useCallback, useState} from 'react'
import {Button, UtcTimestamp} from '@stellar-expert/ui-framework'
import {navigation} from '@stellar-expert/navigation'
import {postApi} from '../../api/interface'
import clientStatus from '../../state/client-status'

export function updateTimeValidation({timestamp, expirationDate, ...settings}) {
    const minDate = settings.config.minDate
    const min = new Date().getTime() + 30 * 60 * 1000
    const max = new Date().getTime() + 10 * 24 * 60 * 60 * 1000
    if (timestamp === 0 && minDate === 0 && expirationDate)
        return true
    if (!timestamp && !minDate || !expirationDate)
        return
    //check only minDate, if set minDate timestamp will be with same value
    if (minDate < min || minDate > max)
        return
    return true
}

export default function ActionConfirmationFormView({settings, timeframe, toggleShowForm}) {
    const [changedSettings, setChangedSettings] = useState(settings)
    const [isReady, setIsReady] = useState(false)
    const [isValidTime, setIsValidTime] = useState(false)
    const [inProgress, setInProgress] = useState(false)

    const validateTime = useCallback(time => {
        try {
            setIsValidTime(!!new Date(time).getTime())
        } catch (err) {
            setIsValidTime(false)
        }
    }, [])


    const updateTimestamp = useCallback(e => {
        const timestamp = parseInt(e.target.value, 10) || 0
        setChangedSettings(prev => {
            const newSettings = {...prev, timestamp}
            newSettings.config.minDate = timestamp
            setIsReady(updateTimeValidation(newSettings))
            return newSettings
        })
        validateTime(timestamp)
    }, [validateTime])

    const updateMinDate = useCallback(e => {
        const minDate = parseInt(e.target.value, 10) || 0
        setChangedSettings(prev => {
            const newSettings = {...prev, timestamp: 0}
            newSettings.config.minDate = minDate
            setIsReady(updateTimeValidation(newSettings))
            return newSettings
        })
        validateTime(minDate)
    }, [validateTime])

    const changeExpirationDate = useCallback(e => {
        const expirationDate = parseInt(e.target.value, 10) || 0
        setChangedSettings(prev => {
            const newSettings = {...prev, expirationDate}
            setIsReady(updateTimeValidation(newSettings))
            return newSettings
        })
        validateTime(expirationDate)
    }, [validateTime])

    const changeDescription = useCallback(e => {
        setChangedSettings(prev => ({...prev, description: e.target.value}))
    }, [])

    const timeFormatter = useCallback(time => {
        if (!timeframe)
            return time
        return (Math.floor(time / timeframe) * timeframe) + (timeframe / 2)
    }, [timeframe])

    const normalizeTimestamp = useCallback(e => {
        const val = parseInt(e.target.value, 10) || 0
        const timestamp = val ? timeFormatter(val) : val
        setChangedSettings(prev => {
            const newSettings = {...prev, timestamp}
            newSettings.config.minDate = timestamp
            return newSettings
        })
    }, [timeFormatter])

    const normalizeMinDate = useCallback(e => {
        const val = parseInt(e.target.value, 10) || 0
        const minDate = val ? timeFormatter(val) : val
        setChangedSettings(prev => {
            const newSettings = {...prev, timestamp: 0}
            newSettings.config.minDate = minDate
            return newSettings
        })
    }, [timeFormatter])

    const confirmUpdates = useCallback(async () => {
        setInProgress(true)
        const signature = await clientStatus.createSignature(changedSettings.config)

        postApi('config', {
            ...changedSettings,
            signatures: [signature]
        })
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                //reload configuration after update
                navigation.updateQuery({reload: 1})
                notify({type: 'success', message: 'Update submitted'})
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to update data'}))
            .finally(() => setInProgress(false))
    }, [changedSettings])

    return <div className="row">
        <div className="column column-50">
            <div className="space"/>
            <label>Scheduled quorum update time (UTC)<br/>
                <span className="dimmed text-tiny">
                    (Set the date for no more than 10 days, in milliseconds)
                </span>
                <input className="micro-space" value={changedSettings.timestamp} onChange={updateTimestamp} onBlur={normalizeTimestamp}/>
                <div className="dimmed text-tiny">
                    {(!!isValidTime && !!changedSettings.timestamp) ? (<UtcTimestamp date={changedSettings.timestamp}/>) : <>&nbsp;</>}
                </div>
            </label>
        </div>
        <div className="column column-50">
            <div className="space"/>
            <label>Min date of quorum update time (UTC)<br/>
                <span className="dimmed text-tiny">
                    (Set the date for no more than 10 days, in milliseconds)
                </span>
                <input className="micro-space" value={changedSettings.config.minDate} onChange={updateMinDate} onBlur={normalizeMinDate}/>
                <div className="dimmed text-tiny">
                    {(!!isValidTime && !!changedSettings.config.minDate) ?
                        (<UtcTimestamp date={changedSettings.config.minDate}/>) : <>&nbsp;</>}
                </div>
            </label>
        </div>
        <div className="column column-50">
            <div className="space"/>
            <label>Expiration date of update (UTC)<br/>
                <span className="dimmed text-tiny">
                    (Set the date in milliseconds)
                </span>
                <input className="micro-space" value={changedSettings.expirationDate} onChange={changeExpirationDate}/>
                <div className="dimmed text-tiny">
                    {(!!isValidTime && !!changedSettings.expirationDate) ?
                        (<UtcTimestamp date={changedSettings.expirationDate}/>) : <>&nbsp;</>}
                </div>
            </label>
        </div>
        <div className="column column-50">
            <div className="space"/>
            <label>Information about configuration update<br/>
                <textarea value={changedSettings.description || ''} onChange={changeDescription} style={{marginTop: '0.55em'}}/>
            </label>
        </div>
        <div className="column column-25 column-offset-50">
            <Button block disabled={!isReady || inProgress} onClick={confirmUpdates}>Confirm</Button>
        </div>
        <div className="column column-25">
            <Button block outline onClick={toggleShowForm}>Cancel</Button>
        </div>
    </div>
}