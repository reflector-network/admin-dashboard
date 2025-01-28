import React, {useCallback, useEffect, useState} from 'react'
import {CopyToClipboard} from '@stellar-expert/ui-framework'
import AddGatewayView from './add-gateway-view'
import {validateGateways} from './gateway-validator'
import {signData} from '../../providers/albedo-provider'

export default function GatewayListView({gateways, challenge, updateGateways, loadConfig, alwaysReveal = false}) {
    const [showEditor, setShowEditor] = useState(false)
    const [validationKey, setValidationKey] = useState('')
    const [gatewaysStatus, setGatewaysStatus] = useState({})

    useEffect(() => {
        if (!challenge)
            return setValidationKey('')
        signData(challenge)
            .then(signature => {
                setValidationKey(Buffer.from(signature, 'hex').toString('base64'))
            })
            .catch(e => {
                console.error(e)
                notify({type: 'error', message: 'Failed to generate gateway validation message'})
            })
    }, [challenge])

    const finishEditing = useCallback(() => setShowEditor(false), [])
    const removeGateway = useCallback(gatewayToRemove => {
        confirm(`Remove ${gatewayToRemove} from the gateway list?`)
            .then(() => {
                const newList = gateways.slice(0)
                newList.splice(newList.indexOf(gatewayToRemove), 1)
                updateGateways(newList)
                setShowEditor(false)
            })
    }, [gateways, updateGateways])

    const addGateway = useCallback(gatewayToAdd => {
        confirm(`Add ${gatewayToAdd} to the gateway list?`)
            .then(() => {
                const newList = gateways.slice(0)
                newList.push(gatewayToAdd)
                updateGateways(newList)
                setShowEditor(false)
            })
    }, [gateways, updateGateways])

    useEffect(() => {
        if (!validationKey || !gateways)
            return
        validateGateways(gateways, validationKey)
            .then(setGatewaysStatus)
    }, [gateways, validationKey])

    if (!gateways)
        return <div className="loader"/>

    return <>
        {!gateways.length ?
            <GatewayConfigLoader loadConfig={loadConfig}/> :
            <ul className="space">
                {gateways.map(gateway =>
                    <GatewayRecord key={gateway} gateway={gateway} validationKey={validationKey} onRemove={removeGateway}
                                   status={gatewaysStatus[gateway]} alwaysReveal={alwaysReveal}/>)}
            </ul>}
        {showEditor ?
            <AddGatewayView gateways={gateways} validationKey={validationKey} onCancel={finishEditing} onAdd={addGateway}/> :
            <div className="space"><a href="#" className="icon-add-circle" onClick={() => setShowEditor(true)}>Add gateway</a></div>
        }
    </>
}

function GatewayRecord({gateway, status, onRemove, alwaysReveal}) {
    const [revealed, setRevealed] = useState(alwaysReveal)
    let gatewayCaption = gateway
    if (!revealed && !alwaysReveal) {
        gatewayCaption = gateway.substring(0, 10) + '*'.repeat(gateway.length - 10)
    }
    return <li key={gateway} className="micro-space">
        <i className="icon-agile"/>
        <code onMouseEnter={() => setRevealed(true)} onMouseLeave={() => setRevealed(false)} style={{cursor: 'default'}}>{gatewayCaption}</code>
        <CopyToClipboard text={gateway}/>
        <a href="#" className="icon-cancel" title="Remove gateway from configuration" onClick={() => onRemove(gateway)}/>&emsp;
        <span className="text-small dimmed" style={{cursor: 'help'}}> <GatewayStatus status={status}/></span>
    </li>
}

function GatewayStatus({status}) {
    if (!status)
        return null
    if (status === 'healthy')
        return <span className="icon-ok"> healthy</span>
    return <span className="icon-warning-circle color-warning"> {status}</span>
}

function GatewayConfigLoader({loadConfig}) {
    const [uploadVisible, setUploadVisible] = useState(false)
    const parse = useCallback(e => {
        const fileReader = new FileReader()
        fileReader.onload = e => {
            try {
                const {urls, challenge} = JSON.parse(e.target.result)
                if (typeof challenge !== 'string' || !challenge.length)
                    return notify({type: 'warning', message: 'Invalid challenge'})
                if (!(urls instanceof Array) || !urls.length)
                    notify({type: 'warning', message: 'The file doesn\'t contain gateway URLs'})
                loadConfig({gateways: urls, challenge})
            } catch (e) {
                notify({type: 'warning', message: 'Invalid file format'})
            }
        }
        fileReader.readAsText(e.target.files[0], 'UTF-8')
    }, [])
    if (!loadConfig)
        return <div className="dimmed text-tiny space text-center">(no configured gateways so far)</div>
    return <div className="dimmed text-tiny space text-center">(add gateways or{' '}
        <a href="#" className="icon-upload" onClick={() => setUploadVisible(true)}>upload your gateways.json </a> config file)
        {uploadVisible && <div><input type="file" style={{width: '10em', display: 'inline-block'}} onChange={parse}/></div>}
    </div>
}