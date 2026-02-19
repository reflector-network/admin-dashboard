import React, {useCallback, useEffect, useState, useMemo} from 'react'
import {AccountAddress, InfoTooltip, withErrorBoundary} from '@stellar-expert/ui-framework'
import {getCurrentConfig, getStatistics} from '../../api/interface'
import NodeStatisticsRecordView from './node-statistics-record-view'

const statsRefreshInterval = 30//30 seconds

export default withErrorBoundary(function NodeStatisticsView() {
    const [statistics, setStatistics] = useState()

    const updateStatistics = useCallback(() => {
        getStatistics()
            .then(statistics => {
                if (statistics.error)
                    throw new Error(statistics.error)
                //getting the latest data
                setStatistics(statistics)
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
        const statsRefresh = setInterval(() => updateStatistics(), statsRefreshInterval * 1000)
        return () => clearInterval(statsRefresh)
    }, [updateStatistics])

    if (!statistics)
        return <div className="loader"/>
    if (statistics.error)
        return <div className="segment error">
            <h3>Failed to load quorum state</h3>
            <div className="space text-small">{statistics.error}</div>
        </div>

    return <div className="segment blank">
        <div>
            <h3 style={{padding: 0}}><i className="icon-hexagon-dice"/>Quorum state</h3>
            <hr className="flare"/>
            <div className="row">
                {Object.keys(statistics.nodeStatistics || {}).map(node => {
                    const connectionIssues = statistics.nodeStatistics[node] ? [...statistics.nodeStatistics[node].connectionIssues] : []
                    const timeshift = statistics.nodeStatistics[node]?.timeshift || 0
                    //check server time
                    if (Math.abs(timeshift) > 5000) {
                        connectionIssues.push('Check server time')
                    }
                    return <div key={node} className="column column-33">
                        <h3 className="space">
                            Node <AccountAddress account={node} link={false} chars={12}/>
                            <ConnectionIssuesView issues={connectionIssues}/></h3>
                        {statistics.nodeStatistics[node] ?
                            <div className="block-indent">
                                <NodeStatisticsRecordView stat={statistics.nodeStatistics[node]}/>
                            </div> :
                            <div className="space text-center">Not connected</div>}
                    </div>
                })}
            </div>

            <div className="row">
                <OracleUpdatesGrid data={statistics}/>
            </div>
        </div>
    </div>
})

function ConnectionIssuesView({issues}) {
    if (!issues?.length)
        return null
    return <InfoTooltip icon="icon-warning color-warning">
        <ul>
            {issues.map(issue => <li key={issue}> - {issue}</li>)}
        </ul>
    </InfoTooltip>
}

const OracleUpdatesGrid = withErrorBoundary(function OracleUpdatesGrid({data}) {
    if (!data.timelines)
        return <div className="loader"/>

    return (
        <div className="oracle-updates-container" style={{padding: '10px 0'}}>
            <h3 className="space">Oracle updates</h3>
            {Object.entries(data.timelines).map(([id, timeline]) => (
                <div key={id} style={{marginBottom: '24px'}}>
                    <div style={{
                        fontSize: '0.9em',
                        marginBottom: '6px',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <AccountAddress account={id} link={false} chars={12}/>
                    </div>

                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '2px',
                        paddingLeft: '4px',
                        borderLeft: '2px solid var(--color-primary, #39d353)'
                    }}>
                        {Object.entries(timeline).map(([ts, hash]) => (
                            <TimelineCell key={ts} ts={ts} hash={hash}/>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
})

function TimelineCell({ts, hash}) {
    //hash: -1 - missing update, 0 - pending, 1 - not required (oracle doesn't have active assets), string - update hash
    const dateStr = new Date(Number(ts)).toLocaleString()

    let backgroundColor = "#39d353"; let tooltip = `Time: ${dateStr}\nStatus: Updated\nTx: ${hash}`
    if (hash === -1) {
        backgroundColor = '#ff4d4f'
        tooltip = `Time: ${dateStr}\nStatus: Missing`
    } else if (hash === 0) {
        backgroundColor = 'gray'
        tooltip = `Time: ${dateStr}\nStatus: Pending`
    } else if (hash === 1) {
        backgroundColor = 'lightgray'
        tooltip = `Time: ${dateStr}\nStatus: Not Required`
    }
    return (
        <div title={tooltip}
             style={{
                width: '12px',
                height: '12px',
                borderRadius: '1px',
                backgroundColor,
                cursor: 'pointer',
                transition: 'transform 0.1s'
             }}
             onMouseEnter={e => {
                e.target.style.transform = 'scale(1.4)'
                e.target.style.zIndex = '10'
             }}
             onMouseLeave={e => {
                e.target.style.transform = 'scale(1)'
                e.target.style.zIndex = '1'
             }}/>
    )
}