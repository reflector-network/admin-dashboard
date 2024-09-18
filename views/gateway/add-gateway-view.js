import React, {useCallback, useEffect, useState} from 'react'
import {Button, CodeBlock} from '@stellar-expert/ui-framework'
import {signData} from '../../providers/albedo-provider'

export default function AddGatewayView({challenge, gateways, onAdd, onCancel}) {
    const [ip, setIp] = useState('')
    const [port, setPort] = useState('8080') //65,535
    const [validation, setValidation] = useState('')
    useEffect(() => {
        if (!challenge)
            return setValidation('')
        signData(challenge)
            .then(signature => setValidation(Buffer.from(signature, 'hex').toString('base64')))
            .catch(e => {
                console.error(e)
                notify({type: 'error', message: 'Failed to generate gateway validation message'})
            })
    }, [challenge])

    const changeIp = useCallback(e => setIp(e.target.value.replace(/[^\d.]/g, '')), [])
    const changePort = useCallback(e => setPort(e.target.value.replace(/\D/g, '')), [])

    function add() {
        const ipParts = ip.split('.').map(p => parseInt(p, 10))
        if (ipParts.length !== 4 || ipParts.some(p => !p || p < 1 || p > 255))
            return notify({type: 'warning', message: 'Invalid IP address'})
        const parsedPort = parseInt(port, 10)
        if (!parsedPort || parsedPort < 1 || parsedPort > 65535)
            return notify({type: 'warning', message: 'Invalid server port number'})
        const newGatewayAddress = `http://${ip}:${port}`
        if (gateways.includes(newGatewayAddress))
            return notify({type: 'warning', message: 'Gateway with the same address has been already registered'})
        onAdd(newGatewayAddress)
    }

    function onKeyDown(e){
        if (e.key === 'Enter'){
            add()
        }
    }

    if (!validation)
        return <div className="loader"/>
    return <div className="space">
        <hr/>
        <h3>Cloud-init config script</h3>
        <div className="dimmed text-tiny">
            <p>
                Use this config to deploy gateway instances. Cloud-init format is widely supported by the majority of cloud providers and
                automation tools, like Terraform. There are no specific requirements for the hardware. The machine or a virtual server must
                have at least 1GB of RAM and a dedicated public IP. Any basic image with Docker installed should be sufficient.
            </p>
            <p>
                Please DO NOT deploy gateways in United States or sanctioned jurisdictions because many crypto platforms block incoming
                API requests from such countries.
            </p>
        </div>
        <CodeBlock lang="plain">{formatConfig(validation, port)}</CodeBlock>
        <h3>Add gateway server</h3>
        <p className="dimmed text-tiny">
            Deploy new server or cloud instance following the instructions above, then copy-paste IP address here to register new gateway.
            At least 4 gateways required for the reliable node operation.
        </p>
        <div className="row">
            <div className="column column-60">
                <label>IP address</label>
                <input type="text" value={ip} onChange={changeIp} onKeyDown={onKeyDown}/>
            </div>
            <div className="column column-40">
                <label>Port</label>
                <input type="text" value={port} onChange={changePort} onKeyDown={onKeyDown}/>
            </div>
        </div>
        <hr/>
        <div className="row space">
            <div className="column column-50">
                <Button outline block onClick={onCancel}>Cancel</Button>
            </div>
            <div className="column column-50">
                <Button block onClick={add}>Add</Button>
            </div>
        </div>
    </div>
}

function formatConfig(validation, port) {
    return `#cloud-config
runcmd:
  - ufw allow ${port}/tcp
  - ufw --force enable
  - docker run -d -p ${port}:8080 --name gateway --restart=unless-stopped -e GATEWAY_VALIDATION_KEY=${validation} reflectornet/reflector-gateway:latest`
}