import React, {useCallback, useState} from 'react'
import {CopyToClipboard} from '@stellar-expert/ui-framework'
import AddGatewayView from './add-gateway-view'

export default function GatewayListView({gateways, challenge, updateGateways, alwaysReveal = false}) {
    const [showEditor, setShowEditor] = useState(false)
    const finishEditing = useCallback(() => setShowEditor(false), [])
    const removeGateway = useCallback(gatewayToRemove => {
        if (!confirm(`Remove ${gatewayToRemove} from the gateway list?`))
            return
        const newList = gateways.slice(0)
        newList.splice(newList.indexOf(gatewayToRemove), 1)
        updateGateways(newList)
        setShowEditor(false)
    }, [gateways, updateGateways])

    const addGateway = useCallback(gatewayToAdd => {
        if (!confirm(`Add ${gatewayToAdd} to the gateway list?`))
            return
        const newList = gateways.slice(0)
        newList.push(gatewayToAdd)
        updateGateways(newList)
        setShowEditor(false)
    }, [gateways, updateGateways])

    if (!gateways)
        return <div className="loader"/>

    return <>
        {!gateways.length ?
            <div className="dimmed text-tiny space text-center">(no configured gateways so far)</div> :
            <ul className="space">
                {gateways.map(gateway => <GatewayRecord gateway={gateway} onRemove={removeGateway} alwaysReveal={alwaysReveal}/>)}
            </ul>}
        {showEditor ?
            <AddGatewayView gateways={gateways} challenge={challenge} onCancel={finishEditing} onAdd={addGateway}/> :
            <div className="space"><a href="#" className="icon-add-circle" onClick={() => setShowEditor(true)}>Add gateway</a></div>
        }
    </>
}

function GatewayRecord({gateway, onRemove, alwaysReveal}) {
    const [revealed, setRevealed] = useState(alwaysReveal)
    let gatewayCaption = gateway
    if (!revealed && !alwaysReveal) {
        gatewayCaption = gateway.substring(0, 10) + '*'.repeat(gateway.length - 10)
    }
    return <li key={gateway} className="micro-space">
        <i className="icon-agile"/>
        <code onMouseEnter={() => setRevealed(true)} onMouseLeave={() => setRevealed(false)} style={{cursor: 'default'}}>{gatewayCaption}</code>
        <CopyToClipboard text={gateway}/>
        <a href="#" className="icon-cancel" title="Remove gateway from configuration" onClick={() => onRemove(gateway)}/>
    </li>
}