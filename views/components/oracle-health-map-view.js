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
                    <ContractType type={data.contractsInfo[id].type}/> <AccountAddress account={id} chars={8}/>
                </h4>
                <div className="oracle-health-timeline-container">
                    {Object.entries(timeline).map(([ts, hash]) => (
                        <TimelineCell key={ts} ts={ts} hash={hash}/>
                    ))}
                </div>
            </div>
        ))}
    </div>
})

function TimelineCell({ts, hash}) {
    let tooltip
    let color = '#39d353'
    let icon = 'icon-ok'
    switch (hash) {
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
            tooltip = <>
                <span>Updated </span>
                <a href={formatExplorerLink('tx', hash)} target="_blank">{shortenString(hash, 10)}<i className="icon-open-new-window"/></a>
            </>
    }

    return <Tooltip maxWidth="16em" trigger={
        <div className="timeline-cell condensed" style={{backgroundColor: color}}/>} desiredPlace="top" offset={{top: 8, left: 8}}>
        <div>
            <UtcTimestamp date={ts}/>
        </div>
        <i className={icon} style={{color}}/> {tooltip}
    </Tooltip>
}

export default OracleHealthMapView