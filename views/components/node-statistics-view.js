import React, {useCallback, useEffect} from 'react'
import TimeAgo from 'react-timeago'
import {observer} from 'mobx-react'
import {AccountAddress, UtcTimestamp, useWindowWidth, withErrorBoundary} from '@stellar-expert/ui-framework'
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
    useEffect(() => {
        if (!clientStatus.statistics) {
            clientStatus.updateStatistics()
        }
    }, [])
    if (!stat || stat.error)
        return <div className="loader"/>

    return <>
        <div>
            <span className="dimmed">Uptime: </span>
            <span className="d-line-block">
                <ElapsedTime ts={stat.startTime}/> <span className="dimmed small">(from <UtcTimestamp date={stat.startTime}/>)</span>
            </span>
        </div>
        <div>
            <span className="dimmed">Last round: </span>
            <span className="d-line-block">
                <ElapsedTime ts={stat.lastProcessedTimestamp} suffix={<span className="dimmed"> ago</span>}/>
            </span>
        </div>
        <div>
            <span className="dimmed">Submitted transactions: </span>
            <span className="d-line-block">
                {stat.submittedTransactions}
            </span>
        </div>
        <div>
            <span className="dimmed">Total processed: </span>
            <span className="d-line-block">
                {stat.totalProcessed}
            </span>
        </div>
        <div>
            <span className="dimmed">Oracle initialization: </span>
            <span className="d-line-block">
                {stat.oracleData.isInitialized ? 'Initialized' : 'Not initialized'}
            </span>
        </div>
        <div>
            <span className="dimmed">Last oracle round: </span>
            <span className="d-line-block">
                <ElapsedTime ts={stat.oracleData.lastOracleTimestamp} suffix={<span className="dimmed"> ago</span>}/>
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
                <span className="d-line-block"><i className="icon-warning color-warning"/> Peer nodes not connected</span>}
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
        <TimeAgo date={ts} formatter={formatter}/>{suffix}
    </span>
}