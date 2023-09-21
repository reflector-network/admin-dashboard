import React, {useCallback, useEffect, useState} from 'react'
import {navigation} from '@stellar-expert/navigation'
import {Button} from '@stellar-expert/ui-framework'
import {getReflectorNodeInfo} from '../../api/interface'
import clientStatus from '../../state/client-status'
import SimplePageLayout from '../layout/simple-page-layout'

function pingServer(apiOrigin) {
    const normalizedApiOrigin = apiOrigin.endsWith('/') ? apiOrigin : (apiOrigin + '/')

    getReflectorNodeInfo(normalizedApiOrigin)
        .then(res => {
            if (res.name !== 'reflector')
                throw new Error('Unexpected response')
            clientStatus.setApiOrigin(normalizedApiOrigin)
            debugger
            navigation.navigate('/')
        })
        .catch(({error}) => notify({type: 'error', message: error?.message || 'Invalid API url'}))
}

export default function ConnectionPage() {
    const [nodeApiUrl, setNodeApiUrl] = useState('')

    const onChange = useCallback(e => setNodeApiUrl(e.target.value.trim()), [])

    const onSave = useCallback(() => {
        setNodeApiUrl(url => {
            pingServer(url)
            return url
        })
    }, [])

    useEffect(() => {
        if (clientStatus.apiOrigin) {
            debugger
            navigation.navigate('/')
        }
    }, [])

    //save on "Enter"
    const onKeyDown = useCallback(function (e) {
        if (e.keyCode === 13) {
            onSave()
        }
    }, [onSave])

    return <SimplePageLayout title="Initial configuration">
        <div>
            Welcome to Reflector administration Dashboard!<br/>Please provide URL of your node admin API to proceed.
        </div>
        <label className="space">Reflector REST API URL
            <input value={nodeApiUrl} onChange={onChange} onKeyDown={onKeyDown}
                   placeholder="URL of your Reflector node, e.g. http://10.17.0.1:3000"/>
        </label>
        <div className="dimmed text-tiny">
            An absolute path, including an IP address for the server or fully-qualified domain name, and port.
            Please make sure that the port is accessible from outside and you have corresponding firewall rules configured.
        </div>
        <div className="row micro-space">
            <div className="column column-50 column-offset-50">
                <Button block disabled={!nodeApiUrl.length} onClick={onSave}>Save</Button>
            </div>
        </div>
    </SimplePageLayout>
}