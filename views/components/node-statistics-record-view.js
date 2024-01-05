import React from 'react'
import {shortenString} from '@stellar-expert/formatter'
import {AccountAddress, ElapsedTime, UtcTimestamp} from '@stellar-expert/ui-framework'

export default function NodeStatisticsRecordView({stat}) {
    return <>
        <div>
            <span className="dimmed">Uptime: </span>
            <span className="inline-block">
                {stat.startTime ?
                    <><ElapsedTime ts={stat.startTime}/> <span className="dimmed small">(from <UtcTimestamp date={stat.startTime}/>)</span></> :
                    'No data'}
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
                    {stat.lastOracleTimestamp ?
                        <ElapsedTime ts={stat.lastOracleTimestamp} suffix={<span className="dimmed"> ago</span>}/> :
                        'No data'}
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