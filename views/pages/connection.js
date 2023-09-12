import React, {useCallback, useState} from 'react'
import {Button} from '@stellar-expert/ui-framework'
import {setGlobalConfigParam} from '../../api/config'
import {getReflectorNodeInfo} from '../../api/interface'
import SimplePageLayout from '../components/simple-page-layout'

function pingServer(nodeApiUrl, initialUrl) {
    const apiUrl = (nodeApiUrl.endsWith('/')) ? nodeApiUrl : nodeApiUrl + '/'

    getReflectorNodeInfo(apiUrl)
        .then(res => {
            if (res.name !== 'reflector')
                throw new Error('Unexpected response')
            setGlobalConfigParam('httpApiUrl', apiUrl)
            window.location.href = initialUrl.startsWith('/config?update=') ? initialUrl : '/'
        })
        .catch(({error}) => notify({type: 'error', message: error?.message || 'Invalid API url'}))
}

export default function ConnectionPage() {
    const [nodeApiUrl, setNodeApiUrl] = useState('')
    const [initialUrl] = useState(window.location.pathname + window.location.search)

    const onChange = useCallback(e => setNodeApiUrl(e.target.value.trim()), [])

    const onSave = useCallback(() => {
        setNodeApiUrl(url => {
            pingServer(url, initialUrl)
            return url
        })
    }, [initialUrl])
    //save on "Enter"
    const onKeyDown = useCallback(function (e) {
        if (e.keyCode === 13) {
            onSave()
        }
    }, [onSave])

    return <SimplePageLayout title="Initial configuration">
        <div>
            Welcome to Reflector Dashboard! Please provide your node API URL to proceed.
        </div>
        <label className="double-space">Reflector REST API URL
            <input value={nodeApiUrl} onChange={onChange} onKeyDown={onKeyDown}
                   placeholder="URL of your Reflector node, e.g. http://10.17.0.1:3000"/>
        </label>
        <div className="dimmed text-tiny">
            An absolute path, including an IP address fo the server or fully-qualified domain name, and port.
            Please make sure that the port is accessible from outside and you have corresponding firewall rules configured.
        </div>
        <div className="row micro-space">
            <div className="column column-50 column-offset-50">
                <Button block disabled={!nodeApiUrl.length} onClick={onSave}>Save</Button>
            </div>
        </div>
    </SimplePageLayout>
}