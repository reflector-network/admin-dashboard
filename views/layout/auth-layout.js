import React, {useCallback, useEffect, useState} from 'react'
import {observer} from 'mobx-react'
import {Button} from '@stellar-expert/ui-framework'
import {checkAlbedoSession, dropSession, requestAlbedoSession, retrieveAlbedoSession} from '../../providers/albedo-provider'
import {getNodePublicKeys} from '../../api/interface'
import clientStatus from '../../state/client-status'
import SimplePageLayout from './simple-page-layout'

export default observer(function AuthLayout({children}) {
    const [authorized, setAuthorized] = useState(null)
    const [inProgress, setInProgress] = useState(false)

    const establishSession = useCallback(function (authPubkey) {
        getNodePublicKeys()
            .then(res => {
                if (!(res && res.indexOf(authPubkey) >= 0)) {
                    dropSession(authPubkey)
                    throw new Error('Please check the key you are using to log in.')
                }
                clientStatus.setNodePubkey(authPubkey)
                clientStatus.hasSession = true
                setInProgress(true)
                setTimeout(() => {
                    setInProgress(false)
                    setAuthorized(true)
                }, 1000)
            })
            .catch(error => {
                setAuthorized(false)
                notify({type: 'error', message: 'Authorization failed. ' + error?.message || ''})
            })
    }, [setAuthorized, setInProgress])

    const authorize = useCallback(() => {
        let authPubkey = null
        requestAlbedoSession()
            .then(pubkey => {
                if (!pubkey)
                    throw new Error('Public key is invalid.')
                authPubkey = pubkey
                return establishSession(pubkey)
            })
    }, [establishSession, requestAlbedoSession])

    useEffect(() => {
        retrieveAlbedoSession()
            .then(pubkey => {
                if (true || checkAlbedoSession(pubkey)) {
                    establishSession(pubkey)
                }
            })
    }, [authorize, establishSession, retrieveAlbedoSession])

    return <div>
        {(!authorized || !clientStatus.hasSession) ?
            <SimplePageLayout title="Authorization">
                <div className="text-center">
                    Please authorize Albedo to cryptographically sign<br/>server requests on behalf of your Reflector node
                    <div className="space">
                        {!inProgress ?
                            <Button onClick={authorize} style={{width: '50%'}}>Authorize</Button> :
                            <div className="loader inline"/>
                        }
                    </div>
                </div>
            </SimplePageLayout> :
            children}
    </div>
})