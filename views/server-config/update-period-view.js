import React, {useCallback, useEffect} from 'react'
import {observer} from 'mobx-react'
import {runInAction} from 'mobx'
import updateRequest from '../../state/config-update-request'
import ActionNodeLayout from './action-node-layout'
import ActionFormLayout from './action-form-layout'

export default observer(function UpdatePeriodView({settings}) {
    useEffect(() => {
        const updateParams = updateRequest.externalRequest
        if (updateParams?.period) {
            runInAction(() => settings.data.period = updateParams?.period)
        } else {
            runInAction(() => settings.data.period = settings.loadedData.period)
        }
        settings.validate()
    }, [settings, settings.data, settings.loadedData])

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
                    <label>Price quotes retention period<br/>
                        <span className="dimmed text-tiny">
                            (How long quoted prices will be available for contract consumers after creation, in milliseconds)
                        </span>
                        <input type="text" className="micro-space" placeholder="Period"
                               value={settings.data.period || ''} onChange={updatePeriod}/>
                    </label>
                </div>
            </div>
        </ActionFormLayout>
    </ActionNodeLayout>
})