import React, {useCallback, useEffect, useState} from 'react'
import {AccountAddress, InfoTooltip, withErrorBoundary} from '@stellar-expert/ui-framework'
import {getStatistics} from '../../api/interface'
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
                {Object.keys(statistics || {}).map(node => {
                    const connectionIssues = statistics[node] ? [...statistics[node].connectionIssues] : []
                    const timeshift = statistics[node]?.timeshift || 0
                    //check server time
                    if (Math.abs(timeshift) > 5000) {
                        connectionIssues.push('Check server time')
                    }
                    return <div key={node} className="column column-33">
                        <h3 className="space">
                            Node <AccountAddress account={node} link={false} chars={12}/>
                            <ConnectionIssuesView issues={connectionIssues}/></h3>
                        {statistics[node] ?
                            <div className="block-indent">
                                <NodeStatisticsRecordView stat={statistics[node]}/>
                            </div> :
                            <div className="space text-center">Not connected</div>}
                    </div>
                })}
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