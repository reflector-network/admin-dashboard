import React, {useCallback} from 'react'
import {observer} from 'mobx-react'
import {runInAction} from 'mobx'
import {DateSelector} from '@stellar-expert/ui-framework'

export default observer(function ActionFormLayout({settings, children}) {
    const updateTimestamp = useCallback(val => {
        runInAction(() => settings.data.timestamp = val * 1000) //timestamp in milliseconds
        settings.validate()
    }, [settings])

    return <div className='row'>
        <div className="column column-66">
            <div className="space"/>
            {children}
        </div>
        <div className="column column-33">
            <div className="space"/>
            <b>Scheduled quorum update (UTC)</b>
            <DateSelector className="micro-space" style={{width: '100%'}}
                          value={settings.data.timestamp || ''} onChange={updateTimestamp}/>
        </div>
    </div>
})