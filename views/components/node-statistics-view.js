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
        setInterval(() => updateStatistics(), statsRefreshInterval * 1000)
    }, [updateStatistics])

    if (!statistics || statistics.error)
        return <div className="loader"/>

    return <div className="segment blank">
        <div>
            <h3 style={{padding: 0}}><i className="icon-hexagon-dice"/>Statistics</h3>
            <hr className="flare"/>
            <div className="row">
                {Object.keys(statistics || {}).map(node => {
                    const connectionIssues = statistics[node] ? [...statistics[node].connectionIssues] : []
                    const timeshift = statistics[node]?.timeshift || 0
                    //check server time
                    if (Math.abs(timeshift) > 5000) {
                        connectionIssues.push('Check server time')
                    }
                    return <div key={node} className="column column-50">
                        <h3 className="space">
                            <AccountAddress account={node} link={false} chars={16}/>
                            <ConnectionIssuesView issues={connectionIssues}/>:</h3>
                        {statistics[node] ?
                            <div className="block-indent">
                                <NodeStatisticsRecordView stat={statistics[node]}/>
                            </div> :
                            <div className="space text-center">No node statistics</div>}
                    </div>
                })}
            </div>
        </div>
    </div>
})

function ConnectionIssuesView({issues = []}) {
    if (!issues.length)
        return <></>

    return <InfoTooltip icon="icon-warning color-warning">
        <ul>
            {issues.map(issue => <li key={issue}> - {issue}</li>)}
        </ul>
    </InfoTooltip>
}