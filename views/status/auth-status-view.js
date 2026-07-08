import React from 'react'
import {AccountAddress} from '@stellar-expert/ui-framework'
import {dropSession} from '../../providers/albedo-provider'
import {useClientStatus} from '../../state/client-status-hooks'

export default function AuthStatusView() {
    const clientStatus = useClientStatus()
    if (!clientStatus.clientPublicKey)
        return <div><i className="icon-circle color-danger"/> Authentication required</div>
    const status = !clientStatus.isMatchingKey ?
        <><i className="icon-warning-circle color-warning"/> Invalid authentication: </> :
        <><i className="icon-ok color-success"/> Authenticated as </>

    return <div className="micro-space">
        {status} <AccountAddress account={clientStatus.clientPublicKey} chars={12} link={false}/>&emsp;|&emsp;
        <a href="#" className="dimmed text-tiny" onClick={dropSession} title="Change authentication">change</a>
    </div>
}