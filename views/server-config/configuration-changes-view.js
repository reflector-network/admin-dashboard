import React, {useEffect, useState} from 'react'
import {UtcTimestamp} from '@stellar-expert/ui-framework'
import configChangesDetector from '../util/config-changes-detector'
import ChangesRecordView from '../components/changes-record-view'

export default function ConfigurationChangesView({configuration}) {
    const [changedData, setChangedData] = useState([])

    useEffect(() => {
        if (!configuration?.pendingConfig)
            return setChangedData([])

        const pendingConfig = configuration.pendingConfig.config.config
        const currentConfig = configuration.currentConfig.config.config
        setChangedData(configChangesDetector(pendingConfig, currentConfig))
        //hide information when update will be completed
        if (configuration.pendingConfig.status === 'pending') {
            const now = new Date().getTime()
            setTimeout(() => {
                setChangedData([])
            }, configuration.pendingConfig.config.timestamp - now)
        }
    }, [configuration])

    return <div className="segment blank h-100">
        <div>
            <h3>Pending quorum upgrade</h3>
            <hr className="flare"/>
            {changedData.length ?
                <div className="space">
                    {changedData.map(data => <ChangesRecordView key={data.type} data={data}/>)}
                    <hr className="double-space"/>
                    <div className="text-right">
                        <span className="dimmed">Changes will be applied:</span>&nbsp;
                        <UtcTimestamp date={configuration.pendingConfig?.config.timestamp || 0}/>
                    </div>
                </div> :
                <div className="double-space text-center">There are no pending updates</div>}
        </div>
    </div>
}