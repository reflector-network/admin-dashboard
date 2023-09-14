import React, {useCallback} from 'react'
import {observer} from 'mobx-react'
import {AccountAddress, BlockSelect} from '@stellar-expert/ui-framework'
import {dropSession} from '../../providers/albedo-provider'
import clientStatus from '../../state/client-status'

export default observer(function ConnectionStatusView() {
    const disconnect = useCallback(() => {
        clientStatus.setApiOrigin('')
    }, [clientStatus])

    if (!clientStatus.apiOrigin)
        return <span>
            <i className="icon-circle color-danger"/> Not connected
        </span>
    return <div>
        <div>
            <i className="icon-ok color-success"/> Connected to&nbsp;
            <BlockSelect inline>{clientStatus.apiOrigin.replace(/\/$/, '')}</BlockSelect>
            &emsp;|&emsp;
            <a href="#" className="dimmed text-tiny" onClick={disconnect} title="Disconnect from current Reflector node">change</a>
        </div>
        <AuthStatus/>
    </div>
})

const AuthStatus = observer(function AuthStatus() {
    if (!clientStatus.pubkey)
        return <div><i className="icon-circle color-danger"/> Authentication required</div>
    const status = !clientStatus.isMatchingKey ?
        <><i className="icon-warning-circle color-warning"/> Invalid authentication: </> :
        <><i className="icon-ok color-success"/> Authenticated as </>

    return <div>
        {status} <AccountAddress account={clientStatus.pubkey} chars={12} link={false}/>&emsp;|&emsp;
        <a href="#" className="dimmed text-tiny" onClick={dropSession} title="Change authentication">change</a>
    </div>
})