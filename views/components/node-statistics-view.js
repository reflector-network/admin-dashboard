import React, {useCallback, useEffect, useState} from 'react'
import {ElapsedTime, UtcTimestamp, withErrorBoundary} from '@stellar-expert/ui-framework'
import {shortenString} from '@stellar-expert/formatter'

export default withErrorBoundary(function NodeStatisticsView({statistics}) {
    return <div className="segment blank">
        <div>
            <h3 style={{padding: 0}}><i className="icon-hexagon-dice"/>Statistics</h3>
            <hr className="flare"/>
            <AllNodeStats stat={statistics}/>
        </div>
    </div>
})

function AllNodeStats({stat}) {
    const [isSmallScreen, setIsSmallScreen] = useState(false)

    const checkScreenSize = useCallback(() => setIsSmallScreen(window.innerWidth < 600), [])

    useEffect(() => {
        checkScreenSize()
        window.addEventListener('resize', checkScreenSize)
        return () => window.removeEventListener('resize', checkScreenSize)
    }, [checkScreenSize])

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
            {stat.connectedNodes.length ?
                <div className="text-small block-indent">
                    {stat.connectedNodes?.map(node => <div key={node.pubkey} className="nano-space">
                        <i className="icon-hexagon-dice color-success"/>{isSmallScreen ? shortenString(node.pubkey, 16) : node.pubkey}
                    </div>)}
                </div> :
                <span className="d-line-block"><i className="icon-warning"/>Peer nodes not connected</span>}
        </div>
    </>
}