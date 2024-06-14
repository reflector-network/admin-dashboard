import React from 'react'
import {AccountAddress, ElapsedTime, UtcTimestamp} from '@stellar-expert/ui-framework'

export default function NodeStatisticsRecordView({stat}) {
    return <div className="text-small">
        <div>
            <span className="dimmed">Software version: </span>
            {stat.version}
        </div>
        <div>
            <span className="dimmed">Uptime: </span>
            <span className="inline-block">
                {stat.startTime ?
                    <><ElapsedTime ts={stat.startTime}/> <span className="dimmed text-tiny">(from <UtcTimestamp date={stat.startTime}/>)</span></> :
                    'No data'}
            </span>
        </div>
        <div>
            <span className="dimmed">Processed transactions: </span>
            <span className="inline-block">
                {stat.totalProcessed || 'No data'}
            </span>
        </div>
        <div>
            <span className="dimmed">Submitted transactions: </span>
            <span className="inline-block">
                {stat.submittedTransactions || 'No data'}
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
        {!!Object.keys(stat.oracleStatistics || {}).length && <OracleStatisticsView statistics={Object.values(stat.oracleStatistics)}/>}
    </div>
}

function OracleStatisticsView({statistics = []}) {
    if (!statistics.length)
        return

    return statistics.map(stat => <div key={stat.oracleId}>
        <h4>Oracle <AccountAddress account={stat.oracleId}/></h4>
        <div className="block-indent text-small">
            <div>
                <span className="dimmed">Contract status: </span>
                <span className="inline-block">{stat.isInitialized ? 'Initialized' : 'Not initialized'}</span>
            </div>
            <div>
                <span className="dimmed">Last processed round: </span>
                <span className="inline-block">
                    {stat.lastOracleTimestamp ?
                        <ElapsedTime ts={stat.lastOracleTimestamp} suffix={<span className="dimmed"> ago</span>}/> :
                        'No data'}
                </span>
            </div>
            <div>
                <span className="dimmed">Processed transactions: </span>
                <span className="inline-block">{stat.totalProcessed || 'No data'}</span>
            </div>
        </div>
    </div>)
}