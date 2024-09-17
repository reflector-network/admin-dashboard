import React, {useCallback, useEffect, useState} from 'react'
import {CopyToClipboard} from '@stellar-expert/ui-framework'
import {getGatewaysInfo, updateGatewaysInfo} from '../../api/interface'
import ConfigLayout from '../server-config/config-layout'
import AddGatewayView from './add-gateway-view'

export default function GatewaysView() {
    const [gateways, setGateways] = useState()
    const [challenge, setChallenge] = useState()
    const [_, loadGateways] = useState(0)
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
    }, [_])
    const updateGateways = useCallback(newGateways => {
        updateGatewaysInfo({challenge, urls: newGateways})
            .then(() => {
                notify({type: 'success', message: 'Gateway successfully added to the node config'})
                loadGateways(new Date().getTime())
            })
            .catch(() => {
                notify({type: 'error', message: 'Failed to add new gateway'})
            })
    }, [challenge, gateways])

    return <ConfigLayout title="Node gateways" description={<GatewaysDescription/>}>
        <GatewayList gateways={gateways} challenge={challenge} updateGateways={updateGateways}/>
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

function GatewayList({gateways, challenge, updateGateways}) {
    const [showEditor, setShowEditor] = useState(false)
    const finishEditing = useCallback(() => setShowEditor(false), [])
    const removeGateway = useCallback(gatewayToRemove => {
        if (!confirm(`Remove ${gatewayToRemove} from the gateway list?`))
            return
        gateways.splice(gateways.indexOf(gatewayToRemove), 1)
        updateGateways(gateways)
        setShowEditor(false)
    }, [gateways, updateGateways])

    const addGateway = useCallback(gatewayToAdd => {
        if (!confirm(`Add ${gatewayToAdd} to the gateway list?`))
            return
        gateways.push(gatewayToAdd)
        updateGateways(gateways)
        setShowEditor(false)
    }, [gateways, updateGateways])

    if (!gateways)
        return <div className="loader"/>

    return <>
        {!gateways.length ?
            <div className="dimmed text-tiny space text-center">(no configured gateways so far)</div> :
            <ul className="space">
                {gateways.map(gateway => <GatewayRecord gateway={gateway} onRemove={removeGateway}/>)}
            </ul>}
        {showEditor ?
            <AddGatewayView gateways={gateways} challenge={challenge} onCancel={finishEditing} onAdd={addGateway}/> :
            <div className="space"><a href="#" className="icon-add-circle" onClick={() => setShowEditor(true)}>Add gateway</a></div>
        }
    </>
}

function GatewayRecord({gateway, onRemove}) {
    const [revealed, setRevealed] = useState(false)
    let gatewayCaption = gateway
    if (!revealed) {
        gatewayCaption = gateway.substring(0, 10) + '*'.repeat(gateway.length - 10)
    }
    return <li key={gateway} className="micro-space">
        <i className="icon-agile"/>
        <code onMouseEnter={() => setRevealed(true)} onMouseLeave={() => setRevealed(false)} style={{cursor: 'default'}}>{gatewayCaption}</code>
        <CopyToClipboard text={gateway}/>
        <a href="#" className="icon-cancel" title="Remove gateway from configuration" onClick={() => onRemove(gateway)}/>
    </li>
}