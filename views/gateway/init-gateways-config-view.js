import React, {useState} from 'react'
import {CopyToClipboard} from '@stellar-expert/ui-framework'
import GatewayListView from './gateway-list-ivew'

export default function InitGatewaysConfigView({forceSetup = false}) {
    const [setup, setSetup] = useState(forceSetup)
    const [gateways, setGateways] = useState([])
    const [challenge, setChallenge] = useState(() => generateRandomChallenge())

    if (!setup)
        return <p className="space">
            Failed to load node gateways configuration. Please check whether your <code>gateways.json</code> config file is correct.
            If there's no gateway configuration yet, <a href="#" onClick={() => setSetup(true)}>create new initial config</a>.
        </p>

    const gatewayConfig = JSON.stringify({urls: gateways, challenge}, null, 2)
    const downloadHref = 'data:application/json,' + encodeURIComponent(gatewayConfig)

    return <div>
        <h3>Initial gateways configuration</h3>
        <GatewayListView gateways={gateways} challenge={challenge} updateGateways={setGateways} alwaysReveal/>
        {gateways.length >= 3 && <div className="space">
            <a href={downloadHref} className="icon-download-circle" download="gateways.json">Download</a> or{' '}
            <CopyToClipboard text={gatewayConfig}><a href="#" className="icon-copy">copy</a></CopyToClipboard> generated config and save it
            as <code>gateways.json</code> in the node home directory.
        </div>}
    </div>
}

function generateRandomChallenge() {
    const key = new Uint8Array(32)
    globalThis.crypto.getRandomValues(key)
    return Buffer.from(key).toString('base64')
}