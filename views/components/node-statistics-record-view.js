import React from 'react'
import {AccountAddress, ElapsedTime, UtcTimestamp} from '@stellar-expert/ui-framework'
import {shortenString} from '@stellar-expert/formatter'

export default function NodeStatisticsRecordView({stat}) {
    const contractStatistics = Object.values(stat.contractStatistics || stat.oracleStatistics || {})
    return <div className="text-small">
        <div>
            <span className="dimmed">Software version: </span>
            {stat.version}
        </div>
        <div>
            <span className="dimmed">Uptime: </span>
            <span className="inline-block">
                {stat.startTime ?
                    <><ElapsedTime ts={stat.startTime}/>
                        <span className="dimmed text-tiny">since <UtcTimestamp date={stat.startTime}/></span></> :
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
        <ContractStatisticsView statistics={contractStatistics}/>
    </div>
}

function ContractStatisticsView({statistics = []}) {
    if (!statistics.length)
        return null

    return statistics.map(stat => <div key={stat.contractId || stat.oracleId}><Stats stat={stat}/></div>)
}

function Stats({stat}) {
    switch (stat.type) {
        case 'subscriptions':
            return <SubscriptionStatsView stat={stat}/>
        case 'dao':
            return <DaoStatsView stat={stat}/>
        default:
            return <OracleStatsView stat={stat}/>
    }
}

function SubscriptionStatsView({stat}) {
    return <>
        <h4>Subscriptions <AccountAddress account={stat.contractId || stat.oracleId}/></h4>
        <div className="block-indent text-small">
            {!stat.isInitialized && <div>
                <span className="dimmed">Contract status: </span>
                <span className="inline-block"><i className="icon-warning-circle color-warning"/> Not initialized</span>
            </div>}
            <div>
                <span className="dimmed">Root hash: </span>
                <span className="inline-block account-key">
                    {stat.syncDataHash ? shortenString(stat.syncDataHash, 8) : 'No data'}
                </span>
            </div>
            <div>
                <span className="dimmed">Processed transactions: </span>
                <span className="inline-block">{stat.totalProcessed || 'No data'}</span>
            </div>
        </div>
    </>
}

function DaoStatsView({stat}) {
    return <>
        <h4>DAO <AccountAddress account={stat.contractId || stat.oracleId}/></h4>
        <div className="block-indent text-small">
            {!stat.isInitialized && <div>
                <span className="dimmed">Contract status: </span>
                <span className="inline-block"><i className="icon-warning-circle color-warning"/> Not initialized</span>
            </div>}
            <div>
                <span className="dimmed">Processed transactions: </span>
                <span className="inline-block">{stat.totalProcessed || 'No data'}</span>
            </div>
        </div>
    </>
}

function OracleStatsView({stat, type}) {
    return <>
        <h4>{type === 'oracle_beam' ? 'BeamOracle' : 'PulseOracle'} <AccountAddress account={stat.contractId || stat.oracleId}/></h4>
        <div className="block-indent text-small">
            {!stat.isInitialized && <div>
                <span className="dimmed">Contract status: </span>
                <span className="inline-block"><i className="icon-warning-circle color-warning"/> Not initialized</span>
            </div>}
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
    </>
}