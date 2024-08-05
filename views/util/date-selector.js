import {useCallback, useEffect, useState} from 'react'
import {debounce} from 'throttle-debounce'
import {trimIsoDateSeconds} from '@stellar-expert/ui-framework/date/date-selector'
import {normalizeDate} from '@stellar-expert/formatter/src/timestamp-format'
import {toUnixTimestamp} from '@stellar-expert/formatter'

const minSelectableValue = trimIsoDateSeconds(new Date('2015-09-30T16:46:00Z'))

export function DateSelector({value, onChange, min, max, ref, ...otherProps}) {
    const [date, setDate] = useState(value ? trimIsoDateSeconds(normalizeDate(value)) : '')
    useEffect(() => {
        if (value) {
            setDate(trimIsoDateSeconds(normalizeDate(value)))
        } else {
            setDate('')
        }
    }, [value])

    const selectDate = useCallback(debounce(400, function (newDate) {
        if (value !== newDate) {
            setDate(newDate)
            if (onChange) {
                onChange(newDate ? toUnixTimestamp(normalizeDate(newDate)) : '')
            }
        }
    }), [onChange, value])

    if (max === undefined) {
        max = trimIsoDateSeconds(new Date(new Date().getTime() + 24 * 60 * 60 * 1000))
    }
    return <input type="datetime-local" value={date} className="date-selector condensed" step={60} ref={ref}
                  min={min || minSelectableValue} max={max} onChange={e => selectDate(e.target.value)}
                  style={{width: '11em', overflow: 'hidden'}} {...otherProps}/>
}