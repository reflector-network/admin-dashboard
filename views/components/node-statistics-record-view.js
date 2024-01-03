import React, {useCallback} from 'react'
import TimeAgo from 'react-timeago'
import {shortenString} from '@stellar-expert/formatter'
import {AccountAddress, UtcTimestamp} from '@stellar-expert/ui-framework'

export default function NodeStatisticsRecordView({stat}) {
    return <>
        <div>
            <span className="dimmed">Uptime: </span>
            <span className="inline-block">
                <ElapsedTime ts={stat.startTime}/> <span className="dimmed small">(from <UtcTimestamp date={stat.startTime}/>)</span>
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