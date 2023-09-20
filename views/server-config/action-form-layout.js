import React, {useCallback, useEffect, useState} from 'react'
import {observer} from 'mobx-react'
import {runInAction} from 'mobx'
import {UtcTimestamp} from '@stellar-expert/ui-framework'
import updateRequest from '../../state/config-update-request'

export default observer(function ActionFormLayout({settings, children}) {
    const timestamp = settings.data.timestamp || updateRequest.hasUpdate && updateRequest.externalRequest.timestamp
    const [isValid, setIsValid] = useState(true)

    useEffect(() => {
        if (updateRequest.hasUpdate && updateRequest.externalRequest.timestamp) {
            runInAction(() => {
                settings.data.timestamp = updateRequest.externalRequest.timestamp
                settings.isNormalizedTimestamp = true
            })
            settings.validate()
        }
    }, [settings])

    const updateTimestamp = useCallback(e => {
        const val = parseInt(e.target.value, 10)
        try {
            setIsValid(!!new Date(val).getTime())
        } catch (err) {
            setIsValid(false)
        }
        runInAction(() => {
            settings.data.timestamp = val
            settings.isNormalizedTimestamp = false
        })
        settings.validate()
    }, [settings])

    const normalizeTimestamp = useCallback(() => settings.normalizeTimestamp(), [settings])

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
                {(!!isValid && !!timestamp) && <div className="dimmed text-tiny">
                    (<UtcTimestamp date={timestamp}/>)
                </div>}
            </label>
        </div>
    </div>
})