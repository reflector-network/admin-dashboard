import React, {useCallback, useState} from 'react'
import {Button, DateSelector} from '@stellar-expert/ui-framework'
import {trimIsoDateSeconds} from '@stellar-expert/ui-framework/date/date-selector'
import {normalizeDate} from '@stellar-expert/formatter/src/timestamp-format'
import {navigation} from '@stellar-expert/navigation'
import {postApi} from '../../../api/interface'
import clientStatus from '../../../state/client-status'

export const minDateUpdate = trimIsoDateSeconds(new Date().getTime() + 30 * 60 * 1000)
export const maxDateUpdate = trimIsoDateSeconds(new Date().getTime() + 10 * 24 * 60 * 60 * 1000)
export const maxExpirationDate = trimIsoDateSeconds(new Date().getTime() + 1000 * 24 * 60 * 60 * 1000)

export function validateTimestamp({timestamp, expirationDate, ...settings}) {
    const minDate = settings.config.minDate
    if (timestamp === 0 && minDate === 0 && expirationDate)
        return true
    if (!timestamp && !minDate || !expirationDate)
        return false
    //check only minDate, if set minDate timestamp will be with same value
    if (minDate < minDateUpdate || minDate > maxDateUpdate)
        return false
    return true
}

export default function ActionConfirmationFormView({settings, timeframe, toggleShowForm}) {
    const [changedSettings, setChangedSettings] = useState(settings)
    const [isOpenTimestamp, setIsOpenTimestamp] = useState(false)
    const [isOpenMinDate, setIsOpenMinDate] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const [allowEarlySubmission, setAllowEarlySubmission] = useState(false)
    const [inProgress, setInProgress] = useState(false)

    const toggleAllowEarlySubmission = useCallback(() => setAllowEarlySubmission(prev => !prev), [])
    const toggleTimestamp = useCallback(() => setIsOpenTimestamp(prev => !prev), [])
    const toggleMinDate = useCallback(() => setIsOpenMinDate(prev => !prev), [])

    const updateTime = useCallback(({minDate, timestamp}) => {
        setChangedSettings(prev => {
            const newSettings = {...prev, timestamp: timestamp || 0}
            newSettings.config.minDate = minDate ? minDate : timestamp || 0
            setIsReady(validateTimestamp(newSettings))
            return newSettings
        })
    }, [])

    const clearTime = useCallback(() => {
        updateTime({timestamp: 0})
        setIsOpenTimestamp(false)
        setIsOpenMinDate(false)
    }, [updateTime, setIsOpenTimestamp, setIsOpenMinDate])

    const changeTimestamp = useCallback(timestamp => {
        updateTime({timestamp})
        setIsOpenMinDate(true)
    }, [updateTime])

    const changeMinDate = useCallback(minDate => {
        updateTime({minDate})
        setIsOpenTimestamp(false)
    }, [updateTime])

    const changeExpirationDate = useCallback(val => {
        const expirationDate = new Date(normalizeDate(val || 0)).getTime()
        setChangedSettings(prev => {
            const newSettings = {...prev, expirationDate}
            setIsReady(validateTimestamp(newSettings))
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
        const val = new Date(normalizeDate(e.target.value || 0)).getTime()
        const timestamp = val ? timeFormatter(val) : val
        updateTime({timestamp})
    }, [timeFormatter, updateTime])

    const normalizeMinDate = useCallback(e => {
        const val = new Date(normalizeDate(e.target.value || 0)).getTime()
        const minDate = val ? timeFormatter(val) : val
        updateTime({minDate})
    }, [timeFormatter, updateTime])

    const confirmUpdates = useCallback(async () => {
        setInProgress(true)
        const signature = await clientStatus.createSignature(changedSettings.config)
        postApi('config', {
            ...changedSettings,
            allowEarlySubmission,
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
    }, [allowEarlySubmission, changedSettings, toggleShowForm])

    return <>
        <div className="space">
            <div>Scheduled</div>
            <span className="dimmed text-tiny">Planned quorum update timestamp (UTC). The update will be applied at this time if
                supported by the majority.</span><br/>
            {!!isOpenTimestamp && <>
                <DateSelector value={changedSettings.timestamp} onChange={changeTimestamp} onBlur={normalizeTimestamp}
                              min={minDateUpdate} max={maxDateUpdate} className="micro-space" style={{'width': '13em'}}/>
                <a className="icon-cancel" onClick={clearTime}/></>}
            {!isOpenTimestamp && <DateInput value={isOpenTimestamp} onChange={toggleTimestamp}/>}
        </div>
        <div className="space">
            <div>Minimum date</div>
            <span className="dimmed text-tiny">Minimum allowed quorum update timestamp (UTC). The update cannot be applied earlier.</span>
            <br/>
            {!!isOpenMinDate && <>
                <DateSelector value={changedSettings.config.minDate} onChange={changeMinDate} onBlur={normalizeMinDate}
                              min={minDateUpdate} max={maxDateUpdate} className="micro-space" style={{'width': '13em'}}/>
                <a className="icon-cancel" onClick={clearTime}/></>}
            {!isOpenMinDate && <DateInput value={isOpenMinDate} onChange={toggleMinDate}/>}
        </div>
        <div className="space">
            <label>Expires<br/>
                <span className="dimmed text-tiny">Expiration timestamp (UTC). If the proposed update doesn't get the majority until
                    this time, it will be discarded automatically.</span><br/>
                <DateSelector value={changedSettings.expirationDate} onChange={changeExpirationDate}
                              min={maxDateUpdate} max={maxExpirationDate} className="micro-space" style={{'width': '13em'}}/>
            </label>
        </div>
        <div className="space">
            <label>
                <input onChange={toggleAllowEarlySubmission} type="checkbox" checked={allowEarlySubmission}/>&nbsp;
                Allow update cluster earlier on consensus
            </label>
            <div className="dimmed text-tiny">
                Allow applying updated settings earlier than scheduled if all node operators confirm the update
            </div>
        </div>
        <div className="space">
            <label>Short configuration update description<br/>
                <span className="dimmed text-tiny">Visible to operators in "Pending updates" and in cluster upgrades history</span>
                <textarea value={changedSettings.description || ''} onChange={changeDescription} style={{marginTop: '0.55em'}}/>
            </label>
        </div>
        <div className="row">
            <div className="column column-25 column-offset-50">
                <Button block disabled={!isReady || inProgress} onClick={confirmUpdates}>Confirm</Button>
            </div>
            <div className="column column-25">
                <Button block outline onClick={toggleShowForm}>Cancel</Button>
            </div>
        </div>
    </>
}

export function DateInput({value, onChange}) {
    return <label>
        <input type="checkbox" checked={!value} onChange={onChange} style={{'marginRight': '0.75em', 'top': '-0.4em'}}/>
        Set automatically
    </label>
}