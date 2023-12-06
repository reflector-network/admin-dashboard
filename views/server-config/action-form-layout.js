import React, {useCallback, useState} from 'react'
import {UtcTimestamp} from '@stellar-expert/ui-framework'

export function updateTimeValidation(settings) {
    const timestamp = settings.timestamp
    const minDate = settings.config.minDate
    const min = new Date().getTime() + 30 * 60 * 1000
    const max = new Date().getTime() + 10 * 24 * 60 * 60 * 1000
    if (!timestamp && !minDate)
        return
    //check only minDate, if set minDate timestamp will be with same value
    if (minDate < min || minDate > max)
        return
    return true
}

export default function ActionFormLayout({timeframe, updateSettings, validation, children}) {
    const [timestamp, setTimestamp] = useState('')
    const [minDate, setMinDate] = useState('')
    const [isValidTime, setIsValidTime] = useState(true)

    const validateTime = useCallback(time => {
        try {
            setIsValidTime(!!new Date(time).getTime())
        } catch (err) {
            setIsValidTime(false)
        }
    }, [])

    const changeUpdateTime = useCallback(({timestamp = 0, minDate = 0}) => {
        setTimestamp(timestamp)
        setMinDate(minDate)
        updateSettings(prev => {
            const newSettings = {...prev, timestamp}
            newSettings.config.minDate = minDate
            validation(newSettings)
            return newSettings
        })
    }, [updateSettings, validation])

    const updateTimestamp = useCallback(e => {
        const val = parseInt(e.target.value, 10)
        changeUpdateTime({timestamp: val, minDate: val})
        validateTime(val)
    }, [changeUpdateTime, validateTime])

    const updateMinDate = useCallback(e => {
        const val = parseInt(e.target.value, 10)
        changeUpdateTime({minDate: val})
        validateTime(val)
    }, [changeUpdateTime, validateTime])

    const timeFormater = useCallback(time => {
        if (!timeframe)
            return time
        return (Math.floor(time / timeframe) * timeframe) + (timeframe / 2)
    }, [timeframe])

    const normalizeTimestamp = useCallback(e => {
        const val = parseInt(e.target.value, 10)
        const time = val ? timeFormater(val) : val
        changeUpdateTime({timestamp: time, minDate: time})
    }, [changeUpdateTime, timeFormater])

    const normalizeMinDate = useCallback(e => {
        const val = parseInt(e.target.value, 10)
        const minDate = val ? timeFormater(val) : val
        changeUpdateTime({minDate})
    }, [changeUpdateTime, timeFormater])

    return <div className="row">
        <div className="column column-66">
            <div className="space"/>
            {children}
        </div>
        <div className="column column-33">
            <div className="space"/>
            <label>Scheduled quorum update time (UTC)<br/>
                <span className="dimmed text-tiny">
                    (Set the date for no more than 10 days, in milliseconds)
                </span>
                <input className="micro-space" value={timestamp || ''} onChange={updateTimestamp} onBlur={normalizeTimestamp}/>
                {(!!isValidTime && !!timestamp) && <div className="dimmed text-tiny">
                    (<UtcTimestamp date={timestamp}/>)
                </div>}
            </label>
            <div className="space"/>
            <label>Min date of quorum update time (UTC)<br/>
                <span className="dimmed text-tiny">
                    (Set the date for no more than 10 days, in milliseconds)
                </span>
                <input className="micro-space" value={minDate || ''} onChange={updateMinDate} onBlur={normalizeMinDate}/>
                {(!!isValidTime && !!minDate) && <div className="dimmed text-tiny">
                    (<UtcTimestamp date={minDate}/>)
                </div>}
            </label>
        </div>
    </div>
}