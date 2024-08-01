import React, {useCallback, useState} from 'react'
import {Button, DateSelector} from '@stellar-expert/ui-framework'
import {trimIsoDateSeconds} from "@stellar-expert/ui-framework/date/date-selector"
import {navigation} from '@stellar-expert/navigation'
import {postApi} from '../../api/interface'
import clientStatus from '../../state/client-status'
import {normalizeDate} from "@stellar-expert/formatter/src/timestamp-format"

export const minDateUpdate = trimIsoDateSeconds(new Date().getTime() + 30 * 60 * 1000)
export const maxDateUpdate = trimIsoDateSeconds(new Date().getTime() + 10 * 24 * 60 * 60 * 1000)

export function updateTimeValidation({timestamp, expirationDate, ...settings}) {
    const minDate = settings.config.minDate
    if (timestamp === 0 && minDate === 0 && expirationDate)
        return true
    if (!timestamp && !minDate || !expirationDate)
        return
    //check only minDate, if set minDate timestamp will be with same value
    if (minDate < minDateUpdate || minDate > maxDateUpdate)
        return
    return true
}

export default function ActionConfirmationFormView({settings, timeframe, toggleShowForm}) {
    const [changedSettings, setChangedSettings] = useState(settings)
    const [isReady, setIsReady] = useState(false)
    const [submitWhenAllReady, setSubmitWhenAllReady] = useState(false)
    const [inProgress, setInProgress] = useState(false)

    const toggleSubmitWhenAllReady = useCallback(() => setSubmitWhenAllReady(prev => !prev), [])

    const updateTimestamp = useCallback(timestamp => {
        setChangedSettings(prev => {
            const newSettings = {...prev, timestamp}
            newSettings.config.minDate = timestamp
            setIsReady(updateTimeValidation(newSettings))
            return newSettings
        })
    }, [])

    const updateMinDate = useCallback(minDate => {
        setChangedSettings(prev => {
            const newSettings = {...prev, timestamp: 0}
            newSettings.config.minDate = minDate
            setIsReady(updateTimeValidation(newSettings))
            return newSettings
        })
    }, [])

    const changeExpirationDate = useCallback(expirationDate => {
        setChangedSettings(prev => {
            const newSettings = {...prev, expirationDate}
            setIsReady(updateTimeValidation(newSettings))
            return newSettings
        })
    }, [])

    const changeDescription = useCallback(e => {
        setChangedSettings(prev => ({...prev, description: e.target.value}))
    }, [])

    const timeFormatter = useCallback(time => {
        if (!timeframe)
            return time
        return (Math.floor(time / timeframe) * timeframe) + (timeframe / 2)
    }, [timeframe])

    const normalizeTimestamp = useCallback(e => {
        const val =  new Date(normalizeDate(e.target.value || 0)).getTime()
        const timestamp = val ? timeFormatter(val) : val
        setChangedSettings(prev => {
            const newSettings = {...prev, timestamp}
            newSettings.config.minDate = timestamp
            return newSettings
        })
    }, [timeFormatter])

    const normalizeMinDate = useCallback(e => {
        const val = new Date(normalizeDate(e.target.value || 0)).getTime()
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
            submitWhenAllReady: submitWhenAllReady,
            signatures: [signature]
        })
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                //reload configuration after update
                toggleShowForm()
                navigation.updateQuery({reload: 1})
                notify({type: 'success', message: 'Update submitted'})
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to update data'}))
            .finally(() => setInProgress(false))
    }, [changedSettings])

    return <div className="row">
        <div className="column column-33">
            <div className="space"/>
            <label>Scheduled quorum update time (UTC)<br/>
                <DateSelector value={changedSettings.timestamp} onChange={updateTimestamp} onBlur={normalizeTimestamp}
                              min={minDateUpdate} max={maxDateUpdate} className="micro-space" style={{'width': '13em'}}/>
            </label>
        </div>
        <div className="column column-33">
            <div className="space"/>
            <label>Min date of quorum update time (UTC)<br/>
                <DateSelector value={changedSettings.config.minDate} onChange={updateMinDate} onBlur={normalizeMinDate}
                              min={minDateUpdate} max={maxDateUpdate} className="micro-space" style={{'width': '13em'}}/>
            </label>
        </div>
        <div className="column column-33">
            <div className="space"/>
            <label>Expiration date of update (UTC)<br/>
                <DateSelector value={changedSettings.expirationDate} onChange={changeExpirationDate}
                              min={minDateUpdate} max={maxDateUpdate} className="micro-space" style={{'width': '13em'}}/>
            </label>
        </div>
        <div className="column">
            <div className="space"/>
            <label>Information about configuration update<br/>
                <textarea value={changedSettings.description || ''} onChange={changeDescription} style={{marginTop: '0.55em'}}/>
            </label>
        </div>
        <div className="column column-50">
            <label className="micro-space">
                <input onChange={toggleSubmitWhenAllReady} type="checkbox" checked={submitWhenAllReady}/>&nbsp;
                Submit when all ready
            </label>
        </div>
        <div className="column column-25">
            <Button block disabled={!isReady || inProgress} onClick={confirmUpdates}>Confirm</Button>
        </div>
        <div className="column column-25">
            <Button block outline onClick={toggleShowForm}>Cancel</Button>
        </div>
    </div>
}