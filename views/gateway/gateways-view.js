import React, {useCallback, useEffect, useState} from 'react'
import {getGatewaysInfo} from '../../api/interface'
import ConfigLayout from '../server-config/config-layout'
import AddGatewayView from './add-gateway-view'

export default function GatewaysView() {
    const [gateways, setGateways] = useState()
    const [challenge, setChallenge] = useState()
    useEffect(() => {
        getGatewaysInfo()
            .then(res => {
                setGateways(res.urls || [])
                setChallenge(res.challenge)
            })
            .catch(e => {
                console.error(e)
                notify({type: 'error', message: 'Failed to load gateway configuration'})
                setGateways([])
                setChallenge('ersdfgsdfgds')
            })
    }, [])
    return <ConfigLayout title="Node gateways" description={<GatewaysDescription/>}>
        <GatewayList gateways={gateways} challenge={challenge}/>
    </ConfigLayout>
}

function GatewaysDescription() {
    return <>
        <p>
            Gateways provide protection from DDoS and resource exhaustion attacks for a Reflector node. All subscription notifications
            get sent over gateway servers, masking the consensus node itself from the potential external attacks.
        </p>
        <p>
            They also balance the load while ensuring the consistency by fetching data from providers using multiple geographically
            distributed servers.
        </p>
    </>
}

function GatewayList({gateways, challenge}) {
    const [adding, setAdding] = useState(false)
    const finishEditing = useCallback(() => setAdding(false), [])

    if (!gateways)
        return <div className="loader"/>

    return <>
        {!gateways.length ?
            <div className="dimmed text-tiny space text-center">(no configured gateways so far)</div> :
            <ul className="space">
                {gateways.map(gateway => <li key={gateway}><i className="icon-agile"/><code>{gateway}</code></li>)}
            </ul>}
        {adding ?
            <AddGatewayView gateways={gateways} challenge={challenge} onFinished={finishEditing}/> :
            <div className="space"><a href="#" className="icon-add-circle" onClick={() => setAdding(true)}>Add gateway</a></div>
        }
    </>
}