import React, {useCallback, useEffect, useState} from 'react'
import {AccountAddress, InfoTooltip, withErrorBoundary} from '@stellar-expert/ui-framework'
import {getStatistics} from '../../api/interface'
import NodeStatisticsRecordView from './node-statistics-record-view'

const statsRefreshInterval = 30//30 seconds

const test = {
    "startTime": 1703588666245,
    "uptime": 217187,
    "currentTime": 1703588883432,
    "lastProcessedTimestamp": 0,
    "totalProcessed": 4,
    "submittedTransactions": 3,
    "connectedNodes": [],
    "oracleStatistics": {
        "CB7ZNEEZOFGPFOY5ADF4U455NSHG3N5N2OVBM6EN6PF4ORBIK7DJRXXE": {
            "isInitialized": true,
            "lastOracleTimestamp": 1703588400000,
            "lastProcessedTimestamp": 1703588700000,
            "oracleId": "CB7ZNEEZOFGPFOY5ADF4U455NSHG3N5N2OVBM6EN6PF4ORBIK7DJRXXE",
            "submittedTransactions": 1,
            "totalProcessed": 2
        },
        "CBSQKYOITJSV7RIM3WPFUJESENEDBEJMSIFFIMJKRQQU35FH2C42IZ7P": {
            "isInitialized": true,
            "lastOracleTimestamp": 1703588400000,
            "lastProcessedTimestamp": 1703588700000,
            "oracleId": "CBSQKYOITJSV7RIM3WPFUJESENEDBEJMSIFFIMJKRQQU35FH2C42IZ7P",
            "submittedTransactions": 2,
            "totalProcessed": 2
        }
    },
    "isTraceEnabled": true,
    "currentConfigHash": "f8a843e60b6248474deee62ca2d4642e9201b5f88bf641ef52e7c779a02ad3a0",
    "pendingConfigHash": null,
    "connectionIssues": ['Issue 1', 'Issue 2'],
    "version": "0.3.0",
    "timeshift": 1
}

console.log(test)

export default withErrorBoundary(function NodeStatisticsView() {
    const [statistics, setStatistics] = useState()

    const updateStatistics = useCallback(() => {
        getStatistics()
            .then(statistics => {
                if (statistics.error)
                    throw new Error(statistics.error)
                //getting the latest data
                setStatistics(statistics[0].nodeStatistics)
            })
            .catch((error) => {
                notify({
                    type: 'error',
                    message: 'Failed to retrieve statistics. ' + (error?.message || '')
                })
                setStatistics(null)
            })
    }, [])

    useEffect(() => {
        updateStatistics()
        setInterval(() => updateStatistics(), statsRefreshInterval * 1000)
    }, [updateStatistics])

    if (!statistics || statistics.error)
        return <div className="loader"/>

    return <div className="segment blank">
        <div>
            <h3 style={{padding: 0}}><i className="icon-hexagon-dice"/>Statistics</h3>
            <hr className="flare"/>
            <div className="row">
                {Object.keys(statistics).map(node => <div key={node} className="column column-50">
                    <h3 className="space">
                        <AccountAddress account={node} link={false} chars={16}/>
                        <ConnectionIssuesView issues={test.connectionIssues}/>:</h3>
                    <div className="block-indent">
                        <NodeStatisticsRecordView stat={statistics[node] || test} node={node}/>
                    </div>
                </div>)}
            </div>
        </div>
    </div>
})

function ConnectionIssuesView({issues = []}) {
    if (!issues.length)
        return

    return <InfoTooltip icon="icon-warning color-warning">
        <ul>
            {issues.map(issue => <li key={issue}> - {issue}</li>)}
        </ul>
    </InfoTooltip>
}