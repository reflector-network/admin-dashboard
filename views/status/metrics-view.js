import React, {useEffect, useState} from 'react'
import {Accordion, CodeBlock, UtcTimestamp, withErrorBoundary} from '@stellar-expert/ui-framework'
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

    const nodes = Object.entries(metrics[0]).filter(([k,v])=>!!v?.info)
        .map(([publicKey, props]) => ({
            key: publicKey,
            title: <><i className={!props.metrics?.length ? 'icon-warning color-warning' : 'icon-cloud'}/> {publicKey}</>,
            content: <>
                {props.info ? <>
                    <div className="text-small dimmed">
                        <UtcTimestamp date={props.info.from}/> Gateways: {props.info.gatewaysCount}
                    </div>
                    {props.metrics.map((record, i) => <NodeMetrics key={i + publicKey} record={record}/>)}
                </> : 'not available'}
            </>
        }))

    return <div className="segment blank">
        <div>
            <h3 style={{padding: 0}}><i className="icon-hexagon-dice"/>Gateway Metrics</h3>
            <hr className="flare"/>
            <Accordion options={nodes}/>
        </div>
    </div>
})

function NodeMetrics({record}) {
    return <div>
        <div className="text-small block-indent">
            <div><span className="dimmed">Total requests: </span>{record.totalCount}&emsp;
                <span className="dimmed">slow: </span>{record.slowResponseCount}</div>
            <div>
                Status:
                <div className="block-indent">{Object.entries(record.statusCodes).map(([code, num]) => <div key={code}>
                    <code>{code}</code>: {num}
                </div>)}
                </div>
            </div>
            {Object.keys(record.errors || {}).length > 0 && <div>
                Errors:
                <div className="block-indent">
                    {Object.entries(record.errors).map(([code, num]) => <div key={code}>
                        <code>{code}</code>: {num}</div>)}
                </div>
            </div>}
        </div>
        <CodeBlock lang="json" style={{maxHeight: '40vh'}}>
            {record.dataStreams ? JSON.stringify(record.dataStreams, null, 2) : '(no data streams)'}
        </CodeBlock>
    </div>
}