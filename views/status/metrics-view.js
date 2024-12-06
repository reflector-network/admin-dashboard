import React, {useEffect, useState} from 'react'
import {CodeBlock, withErrorBoundary} from '@stellar-expert/ui-framework'
import {getMetrics} from '../../api/interface'

export default withErrorBoundary(function MetricsView() {
    const [metrics, setMetrics] = useState()
    useEffect(() => {
        getMetrics()
            .then(metrics => {
                if (metrics.error)
                    throw new Error(metrics.error)
                //getting the latest data
                setMetrics(metrics)
            })
            .catch((error) => {
                notify({
                    type: 'error',
                    message: 'Failed to retrieve statistics. ' + (error?.message || '')
                })
                setMetrics(null)
            })
    }, [])

    if (!metrics)
        return <div className="loader"/>
    if (metrics.error)
        return <div className="segment error">
            <h3>Failed to load quorum metrics</h3>
            <div className="space text-small">{metrics.error}</div>
        </div>

    return <div className="segment blank">
        <div>
            <h3 style={{padding: 0}}><i className="icon-hexagon-dice"/>Gateway Metrics</h3>
            <hr className="flare"/>
            <CodeBlock lang="json">
                {JSON.stringify(metrics.gatewaysMetrics, null, 2)}
            </CodeBlock>
        </div>
    </div>
})