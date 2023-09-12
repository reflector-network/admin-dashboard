import React from 'react'
import config, {resetNode} from '../../api/config'
import {BlockSelect} from '@stellar-expert/ui-framework'

export default function ConnectionStatusView() {
    if (!config.httpApiUrl)
        return <span>
            <i className="icon-circle color-danger"/> Not connected
        </span>
    return <span>
        <i className="icon-ok color-success"/> Connected to <BlockSelect inline>{config.httpApiUrl.replace(/\/$/, '')}</BlockSelect>
        &emsp;|&emsp;
        <a href="#" className="dimmed" onClick={resetNode} title="Disconnect from current Reflector node">disconnect</a>
    </span>
}