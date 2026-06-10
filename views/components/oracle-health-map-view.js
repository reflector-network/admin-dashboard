import React from 'react'
import {AccountAddress, formatExplorerLink, Tooltip, UtcTimestamp, withErrorBoundary} from '@stellar-expert/ui-framework'
import './oracle-health-map-view.scss'
import {shortenString} from '@stellar-expert/formatter'
import ContractType from './contract-type'

const OracleHealthMapView = withErrorBoundary(function OracleHealthMapView({data}) {
    if (!data.timelines)
        return <div className="loader"/>

    return <div className="oracle-updates-container micro-space">
        {Object.entries(data.timelines).map(([id, timeline]) => (
            <div key={id}>
                <h4>
                    <ContractType type={data.contractsInfo[id].type}/> <AccountAddress account={id} chars={8} name={false}/>
                </h4>
                <div className="oracle-health-timeline-container">
                    {Object.entries(timeline).map(([ts, update]) => (
                        <TimelineCell key={ts} ts={ts} update={update} nodes={data.nodes}/>
                    ))}
                </div>
            </div>
        ))}
    </div>
})

function TimelineCell({ts, update, nodes}) {
    let tooltip
    let color = '#39d353'
    let icon = 'icon-ok'
    let opacity = 1
    let missingNodes = null
    switch (update) {
    case -1:
        tooltip = 'Missing update'
        color = '#ff4d4f'
        icon = 'icon-warning'
        break
    case 0:
        tooltip = 'Pending'
        color = 'gray'
        icon = 'icon-clock'
        break
    case 1: //oracle doesn't have active assets
        tooltip = 'Not Required'
        color = 'lightgray'
        icon = 'icon-minus-circle'
        break
    default:
        if (update.signers && update.signers.length !== nodes.length) {
            opacity = (update.signers.length || 1) / nodes.length
            missingNodes = nodes.filter(node => !update.signers.includes(node.pubkey))
        }
        tooltip = <>
            <span>Updated </span>
            <a href={formatExplorerLink('tx', update?.tx || update)} target="_blank" rel="noreferrer">{shortenString(update?.tx, 10)}<i className="icon-open-new-window"/></a>
        </>
    }

    return <Tooltip maxWidth="16em" trigger={
        <div className="timeline-cell condensed" style={{backgroundColor: color, opacity}}/>} desiredPlace="top" offset={{top: 8, left: 8}}>
        <div>
            <UtcTimestamp date={ts}/>
        </div>
        <i className={icon} style={{color}}/> {tooltip}
        {missingNodes && missingNodes.length > 0 ? <div className="missing-nodes condensed">
            <span className="dimmed">Missing Nodes: </span>
            <span className="text-small ">{missingNodes.map(node => node.domain).join(', ')}</span>
        </div> : null}
    </Tooltip>
}

export default OracleHealthMapView