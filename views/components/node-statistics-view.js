import React, {useCallback, useEffect, useState} from 'react'
import TimeAgo from 'react-timeago'
import {observer} from 'mobx-react'
import {AccountAddress, UtcTimestamp, useWindowWidth, withErrorBoundary} from '@stellar-expert/ui-framework'
import {postApi} from '../../api/interface'
import clientStatus from '../../state/client-status'

export default withErrorBoundary(function NodeStatisticsView() {
    return <div className="segment blank">
        <div>
            <h3 style={{padding: 0}}><i className="icon-hexagon-dice"/>Statistics</h3>
            <hr className="flare"/>
            <AllNodeStats/>
        </div>
    </div>
})

const AllNodeStats = observer(function AllNodeStats() {
    const screenWidth = useWindowWidth()
    const isSmallScreen = screenWidth < 600
    const stat = clientStatus.statistics
    const [isTraceEnabled, setIsTraceEnabled] = useState(stat?.isTraceEnabled)
    useEffect(() => {
        if (!clientStatus.statistics) {
            clientStatus.updateStatistics()
        }
    }, [])

    const toggleTrace = useCallback(() => {
        postApi('trace', {isTraceEnabled: !isTraceEnabled})
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                notify({type: 'success', message: 'Update completed'})
                setIsTraceEnabled(prev => !prev)
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to update tracing'}))
    }, [isTraceEnabled])

    if (!stat || stat.error)
        return <div className="loader"/>

    return <>
        <div>
            <span className="dimmed">Uptime: </span>
            <span className="inline-block">
                <ElapsedTime ts={stat.startTime}/> <span className="dimmed small">(from <UtcTimestamp date={stat.startTime}/>)</span>
            </span>
        </div>
        <div>
            <span className="dimmed">Last round: </span>
            <span className="inline-block">
                <ElapsedTime ts={stat.lastProcessedTimestamp} suffix={<span className="dimmed"> ago</span>}/>
            </span>
        </div>
        <div>
            <span className="dimmed">Submitted transactions: </span>
            <span className="inline-block">
                {stat.submittedTransactions}
            </span>
        </div>
        <div>
            <span className="dimmed">Total processed: </span>
            <span className="inline-block">
                {stat.totalProcessed}
            </span>
        </div>
        <div>
            <span className="dimmed">Oracle initialization: </span>
            <span className="inline-block">
                {stat.oracleData.isInitialized ? 'Initialized' : 'Not initialized'}
            </span>
        </div>
        <div>
            <span className="dimmed">Last oracle round: </span>
            <span className="inline-block">
                <ElapsedTime ts={stat.oracleData.lastOracleTimestamp} suffix={<span className="dimmed"> ago</span>}/>
            </span>
        </div>
        <div>
            <span className="dimmed">Tracing: </span>
            <span className="inline-block">
                {isTraceEnabled ? 'Enabled' : 'Disabled'}&emsp;|&emsp;
                <a href="#" onClick={toggleTrace} title="Enable/Disable tracing">
                    {!isTraceEnabled ? 'enable' : 'disable'}
                </a>
            </span>
        </div>
        <div>
            <span className="dimmed">Connected nodes: </span>
            {!!stat.connectedNodes.length ?
                <div className="text-small block-indent">
                    {stat.connectedNodes.map(node => <div key={node} className="nano-space">
                        <i className="icon-hexagon-dice color-success"/>
                        <AccountAddress account={node} link={false} chars={isSmallScreen ? 'all' : 16}/>
                    </div>)}
                </div> :
                <span className="inline-block"><i className="icon-warning color-warning"/> Peer nodes not connected</span>}
        </div>
    </>
})

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