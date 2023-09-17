import React, {useCallback} from 'react'
import {observer} from 'mobx-react'
import {runInAction} from 'mobx'
import {DateSelector} from '@stellar-expert/ui-framework'
import updateRequest from '../../state/config-update-request'

function trimSeconds(date) {
    if (typeof date === 'number') {
        date = new Date(date)
    }
    return date.toISOString().replace(/:\d{2}\.\d*Z/, '')
}

export default observer(function ActionFormLayout({settings, children}) {
    const timestamp = settings.timestamp || updateRequest.hasUpdate && updateRequest.externalRequest.timestamp
    const min = trimSeconds(new Date().getTime() + 30 * 60 * 1000)
    const max = trimSeconds(new Date().getTime() + 10 * 24 * 60 * 60 * 1000)
    const updateTimestamp = useCallback(val => {
        runInAction(() => settings.data.timestamp = val * 1000) //timestamp in milliseconds
        settings.validate()
    }, [settings])

    return <div className="row">
        <div className="column column-66">
            <div className="space"/>
            {children}
        </div>
        <div className="column column-33">
            <div className="space"/>
            <label>Scheduled quorum update time (UTC)
                <DateSelector className="micro-space" style={{width: '100%'}} value={timestamp || ''} onChange={updateTimestamp} min={min} max={max}/>
            </label>
        </div>
    </div>
})