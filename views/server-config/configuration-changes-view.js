import React, {useEffect, useState} from 'react'
import {UtcTimestamp} from '@stellar-expert/ui-framework'
import detectConfigChanges from '../util/config-changes-detector'
import ChangesRecordView from '../components/changes-record-view'

export default function ConfigurationChangesView({configuration}) {
    const [changedData, setChangedData] = useState([])

    useEffect(() => {
        if (!configuration?.pendingConfig)
            return setChangedData([])

        const pendingConfig = configuration.pendingConfig.config.config
        const currentConfig = configuration.currentConfig.config.config
        setChangedData(detectConfigChanges(pendingConfig, currentConfig))
    }, [configuration])

    return <div className="segment blank h-100">
        <div>
            <div className="row">
                <div className="column column-50"><h3>Pending quorum upgrade</h3></div>
                <div className="column column-50 text-right mobile-left micro-space text-tiny">{changedData.length > 0 && <>
                    Scheduled <UtcTimestamp date={configuration.pendingConfig?.config.timestamp || 0}/>
                </>}</div>
            </div>
            <hr className="flare"/>
            {changedData.length > 0 && <div className="space">
                <h4>Changes:</h4>
                <div>{changedData.map(data => <ChangesRecordView key={data.type + data.action + data.uid} data={data}/>)}</div>
            </div>}
            {!changedData.length && <div className="double-space text-center">There are no pending updates</div>}
        </div>
    </div>
}