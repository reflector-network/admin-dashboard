import React, {useEffect, useState} from 'react'
import {UtcTimestamp} from '@stellar-expert/ui-framework'
import detectConfigChanges from '../../util/config-changes-detector'
import ChangesRecordView from '../../components/changes-record-view'
import ConfigLayout from '../config-layout'

export default function ConfigurationChangesView({configuration}) {
    const [changedData, setChangedData] = useState([])

    useEffect(() => {
        if (!configuration?.pendingConfig)
            return setChangedData([])

        const pendingConfig = configuration.pendingConfig.config.config
        const currentConfig = configuration.currentConfig.config.config
        setChangedData(detectConfigChanges(pendingConfig, currentConfig))
    }, [configuration])

    const scheduled = changedData.length > 0 && <span className="text-tiny">
        Scheduled <UtcTimestamp date={configuration.pendingConfig?.config.timestamp || 0}/>
    </span>
    return <ConfigLayout title="Pending cluster settings update" primaryAction={scheduled}>
        {changedData.length > 0 && <div className="space">
            <div>{changedData.map(data => <ChangesRecordView key={data.type + data.action + data.uid} data={data}/>)}</div>
        </div>}
        {!changedData.length && <div className="double-space text-center text-tiny dimmed">(no pending updates at the moment)</div>}
    </ConfigLayout>
}