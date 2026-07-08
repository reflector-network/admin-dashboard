import React from 'react'
import {AccountAddress, ElapsedTime, UtcTimestamp} from '@stellar-expert/ui-framework'
import {shortenString} from '@stellar-expert/formatter'
import {resolveNodeName} from '../../api/interface'

export default function NodeStatisticsRecordView({pubkey, stat, allNodes}) {
    const contractStatistics = Object.values(stat.contractStatistics || stat.oracleStatistics || {})
    const disconnectedNodes = stat.connectedNodes.length === allNodes.length - 1 ? [] :
        allNodes.filter(node => node !== pubkey && !stat.connectedNodes.includes(node))
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
                        <span className="dimmed text-tiny"> since <UtcTimestamp date={stat.startTime}/></span></> :
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
        {disconnectedNodes.length > 0 && <div>
            <span className="dimmed"><span className="icon-warning color-warning"/>Disconnected nodes: </span>
            <div className="text-small block-indent">
                {disconnectedNodes.map(node => <div key={node} className="nano-space">
                    <i className="icon-hexagon-dice color-warning"/>
                    {resolveNodeName(node)}
                </div>)}
            </div>
        </div>}

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
    return <ContractStatWrapper stat={stat} title="Subscriptions">
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
    </ContractStatWrapper>
}

function DaoStatsView({stat}) {
    return <ContractStatWrapper stat={stat} title="DAO">
        {!stat.isInitialized && <div>
            <span className="dimmed">Contract status: </span>
            <span className="inline-block"><i className="icon-warning-circle color-warning"/> Not initialized</span>
        </div>}
        <div>
            <span className="dimmed">Processed transactions: </span>
            <span className="inline-block">{stat.totalProcessed || 'No data'}</span>
        </div>
    </ContractStatWrapper>
}

function OracleStatsView({stat, type}) {
    return <ContractStatWrapper stat={stat} title={type === 'oracle_beam' ? 'BeamOracle' : 'PulseOracle'}>
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
    </ContractStatWrapper>
}

function ContractStatWrapper({title, stat, children}) {
    return <>
        <h4 style={{margin: 0}}>
            {title} <AccountAddress account={stat.contractId || stat.oracleId} name={false}/>
        </h4>
        <div className="block-indent text-small">{children}</div>
    </>
}