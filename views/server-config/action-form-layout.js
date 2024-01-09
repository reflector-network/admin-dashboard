import React, {useCallback, useState} from 'react'
import {UtcTimestamp} from '@stellar-expert/ui-framework'

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

export default function ActionFormLayout({timeframe, settings, updateSettings, validation, children}) {
    const [isValidTime, setIsValidTime] = useState(false)

    const validateTime = useCallback(time => {
        try {
            setIsValidTime(!!new Date(time).getTime())
        } catch (err) {
            setIsValidTime(false)
        }
    }, [])

    const updateTimestamp = useCallback(e => {
        const timestamp = parseInt(e.target.value, 10) || 0
        updateSettings(prev => {
            const newSettings = {...prev, timestamp}
            newSettings.config.minDate = timestamp
            validation(newSettings)
            return newSettings
        })
        validateTime(timestamp)
    }, [updateSettings, validation, validateTime])

    const updateMinDate = useCallback(e => {
        const minDate = parseInt(e.target.value, 10) || 0
        updateSettings(prev => {
            const newSettings = {...prev, timestamp: 0}
            newSettings.config.minDate = minDate
            validation(newSettings)
            return newSettings
        })
        validateTime(minDate)
    }, [updateSettings, validation, validateTime])

    const changeExpirationDate = useCallback(e => {
        const expirationDate = parseInt(e.target.value, 10) || 0
        updateSettings(prev => {
            const newSettings = {...prev, expirationDate}
            validation(newSettings)
            return newSettings
        })
    }, [updateSettings, validation])

    const changeDescription = useCallback(e => {
        updateSettings(prev => ({...prev, description: e.target.value}))
    }, [updateSettings])

    const timeFormatter = useCallback(time => {
        if (!timeframe)
            return time
        return (Math.floor(time / timeframe) * timeframe) + (timeframe / 2)
    }, [timeframe])

    const normalizeTimestamp = useCallback(e => {
        const val = parseInt(e.target.value, 10) || 0
        const timestamp = val ? timeFormatter(val) : val
        updateSettings(prev => {
            const newSettings = {...prev, timestamp}
            newSettings.config.minDate = timestamp
            return newSettings
        })
    }, [updateSettings, timeFormatter])

    const normalizeMinDate = useCallback(e => {
        const val = parseInt(e.target.value, 10) || 0
        const minDate = val ? timeFormatter(val) : val
        updateSettings(prev => {
            const newSettings = {...prev, timestamp: 0}
            newSettings.config.minDate = minDate
            return newSettings
        })
    }, [updateSettings, timeFormatter])

    return <div className="space">
        {children}
        <div className="row">
            <div className="column column-50">
                <div className="space"/>
                <label>Scheduled quorum update time (UTC)<br/>
                    <span className="dimmed text-tiny">
                        (Set the date for no more than 10 days, in milliseconds)
                    </span>
                    <input className="micro-space" value={settings.timestamp} onChange={updateTimestamp} onBlur={normalizeTimestamp}/>
                    {(!!isValidTime && !!settings.timestamp) && <div className="dimmed text-tiny">
                        (<UtcTimestamp date={settings.timestamp}/>)
                    </div>}
                </label>
            </div>
            <div className="column column-50">
                <div className="space"/>
                <label>Min date of quorum update time (UTC)<br/>
                    <span className="dimmed text-tiny">
                        (Set the date for no more than 10 days, in milliseconds)
                    </span>
                    <input className="micro-space" value={settings.config.minDate} onChange={updateMinDate} onBlur={normalizeMinDate}/>
                    {(!!isValidTime && !!settings.config.minDate) && <div className="dimmed text-tiny">
                        (<UtcTimestamp date={settings.config.minDate}/>)
                    </div>}
                </label>
            </div>
            <div className="column column-50">
                <div className="space"/>
                <label>Expiration date of update (UTC)<br/>
                    <span className="dimmed text-tiny">
                        (Set the date in milliseconds)
                    </span>
                    <input className="micro-space" value={settings.expirationDate} onChange={changeExpirationDate}/>
                    {(!!isValidTime && !!settings.expirationDate) && <div className="dimmed text-tiny">
                        (<UtcTimestamp date={settings.expirationDate}/>)
                    </div>}
                </label>
            </div>
            <div className="column column-50">
                <div className="space"/>
                <label>Information about configuration update<br/>
                    <textarea value={settings.description || ''} onChange={changeDescription} style={{marginTop: '0.55em'}}/>
                </label>
            </div>
        </div>
    </div>
}