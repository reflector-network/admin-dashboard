import React from 'react'
import {observer} from 'mobx-react'
import {AccountAddress} from '@stellar-expert/ui-framework'
import {dropSession} from '../../providers/albedo-provider'
import clientStatus from '../../state/client-status'

export default observer(function AuthStatusView() {
    if (!clientStatus.clientPublicKey)
        return <div><i className="icon-circle color-danger"/> Authentication required</div>
    const status = !clientStatus.isMatchingKey ?
        <><i className="icon-warning-circle color-warning"/> Invalid authentication: </> :
        <><i className="icon-ok color-success"/> Authenticated as </>

    return <div>
        {status} <AccountAddress account={clientStatus.clientPublicKey} chars={12} link={false}/>&emsp;|&emsp;
        <a href="#" className="dimmed text-tiny" onClick={dropSession} title="Change authentication">change</a>
    </div>
})