import React, {useCallback, useEffect, useState} from 'react'
import TimeAgo from 'react-timeago'
import {observer} from 'mobx-react'
import {shortenString} from '@stellar-expert/formatter'
import {AccountAddress, InfoTooltip, UtcTimestamp, withErrorBoundary} from '@stellar-expert/ui-framework'
import {postApi} from '../../api/interface'
import clientStatus from '../../state/client-status'

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

export default withErrorBoundary(observer(function NodeStatisticsView() {
    const statistics = clientStatus.statistics?.nodeStatistics

    useEffect(() => {
        if (!clientStatus.statistics) {
            setTimeout(() => clientStatus.updateStatistics(), 500)
        }
    }, [])

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
                        <AllNodeStats key={node} stat={statistics[node] || test} node={node}/>
                    </div>
                </div>)}
            </div>
        </div>
    </div>
}))


function AllNodeStats({stat, node}) {
    const [isTraceEnabled, setIsTraceEnabled] = useState(stat.isTraceEnabled)

    const updateTrace = useCallback(() => {
        postApi('trace', {isTraceEnabled: !isTraceEnabled})
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                notify({type: 'success', message: 'Update completed'})
                setIsTraceEnabled(!isTraceEnabled)
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to update tracing'}))
    }, [isTraceEnabled])

    return <>
        <div>
            <span className="dimmed">Uptime: </span>
            <span className="inline-block">
                <ElapsedTime ts={stat.startTime}/> <span className="dimmed small">(from <UtcTimestamp date={stat.startTime}/>)</span>
            </span>
        </div>
        <div>
            <span className="dimmed">Last round: </span>
            <span className="inline-block">
                <ElapsedTime ts={stat.lastProcessedTimestamp} suffix={<span className="dimmed"> ago</span>}/>
            </span>
        </div>
        {!!Object.keys(stat.oracleStatistics || {}).length && <OracleStatisticsView statistics={Object.values(stat.oracleStatistics)}/>}
        <div>
            <span className="dimmed">Submitted transactions: </span>
            <span className="inline-block">
                {stat.submittedTransactions || 'No data'}
            </span>
        </div>
        <div>
            <span className="dimmed">Total processed: </span>
            <span className="inline-block">
                {stat.totalProcessed || 'No data'}
            </span>
        </div>
        <div>
            <span className="dimmed">Tracing: </span>
            <span className="inline-block">
                {isTraceEnabled ? 'Enabled' : 'Disabled'}&emsp;|&emsp;
                <a href="#" onClick={updateTrace} title="Enable/Disable tracing">
                    {!isTraceEnabled ? 'enable' : 'disable'}
                </a>
            </span>
        </div>
        <div>
            <span className="dimmed">Connected nodes: </span>
            {stat?.connectedNodes.length ?
                <div className="text-small block-indent">
                    {stat.connectedNodes.map(node => <div key={node} className="nano-space">
                        <i className="icon-hexagon-dice color-success"/>
                        <AccountAddress account={node} link={false} chars={16}/>
                    </div>)}
                </div> :
                <span className="inline-block"><i className="icon-warning color-warning"/> Peer nodes not connected</span>}
        </div>
    </>
}

function ConnectionIssuesView({issues = []}) {
    if (!issues.length)
        return

    return <InfoTooltip icon="icon-warning color-warning">
        <ul>
            {issues.map(issue => <li key={issue}> - {issue}</li>)}
        </ul>
    </InfoTooltip>
}

function OracleStatisticsView({statistics = []}) {
    if (!statistics.length)
        return

    return statistics.map(stat => <div key={stat.oracleId}>
        <span title={stat.oracleId}>{shortenString(stat.oracleId)}</span>
        <div className="block-indent">
            <div>
                <span className="dimmed">Oracle initialization: </span>
                <span className="inline-block">
                    {stat.isInitialized ? 'Initialized' : 'Not initialized'}
                </span>
            </div>
            <div>
                <span className="dimmed">Last oracle round: </span>
                <span className="inline-block">
                    <ElapsedTime ts={stat.lastOracleTimestamp} suffix={<span className="dimmed"> ago</span>}/>
                </span>
            </div>
            <div>
                <span className="dimmed">Submitted transactions: </span>
                <span className="inline-block">
                    {stat.submittedTransactions || 'No data'}
                </span>
            </div>
            <div>
                <span className="dimmed">Total processed: </span>
                <span className="inline-block">
                    {stat.totalProcessed || 'No data'}
                </span>
            </div>
        </div>
    </div>)
}

const timeUnits = {
    second: 's',
    minute: 'm',
    hour: 'h',
    day: 'd',
    week: 'w',
    month: 'mo',
    year: 'y'
}

function ElapsedTime({ts, className, suffix}) {
    const formatter = useCallback((v, unit) => `${v}${timeUnits[unit]}`, [])

    return <span className={className}>
        {ts ? <><TimeAgo date={ts} formatter={formatter}/>{suffix}</> : 'No data'}
    </span>
}