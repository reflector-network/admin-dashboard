import React, {useCallback, useEffect} from 'react'
import {observer} from 'mobx-react'
import {runInAction} from 'mobx'
import parseExternalUpdateRequest from '../util/external-update-request-parser'
import ActionNodeLayout from './action-node-layout'
import ActionFormLayout from './action-form-layout'

export default observer(function UpdatePeriodView({settings}) {
    useEffect(() => {
        const updateParams = parseExternalUpdateRequest()
        if (updateParams?.period) {
            runInAction(() => settings.data.period = updateParams?.period)
        } else {
            runInAction(() => settings.data.period = settings.loadedData.period)
        }
    }, [settings.data, settings.loadedData])

    const updatePeriod = useCallback(e => {
        const val = e.target.value.replace(/[^0-9]/g, '')
        runInAction(() => settings.data.period = parseInt(val, 10))
        settings.validate()
    }, [settings])

    return <ActionNodeLayout settings={settings}>
        <h3>Retention period</h3>
        <hr className="flare"/>
        <ActionFormLayout settings={settings}>
            <div className="row">
                <div className="column column-50">
                    <b>Period of update nodes</b>
                    <input type="text" className="micro-space" placeholder="Period"
                           value={settings.data.period || ''} onChange={updatePeriod}/>
                </div>
            </div>
        </ActionFormLayout>
    </ActionNodeLayout>
})