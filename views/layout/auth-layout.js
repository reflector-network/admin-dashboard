import React, {useCallback, useState} from 'react'
import {observer} from 'mobx-react'
import {Button} from '@stellar-expert/ui-framework'
import {requestAlbedoSession} from '../../providers/albedo-provider'
import clientStatus from '../../state/client-status'
import {getNodePublicKeys} from '../../api/interface'
import SimplePageLayout from './simple-page-layout'

export default observer(function AuthLayout({children}) {
    const [authorized, setAuthorized] = useState(null)
    const authorize = useCallback(() => {
        let authPubkey = null
        requestAlbedoSession()
            .then(pubkey => {
                if (!pubkey)
                    return setAuthorized(false)
                authPubkey = pubkey
                return getNodePublicKeys()
            })
            .then(res => {
                if (!(res && res.indexOf(authPubkey) >= 0))
                    return setAuthorized(false)
                clientStatus.setNodePubkey(authPubkey)
                //for some reason, immidiatly after session created, sign data is not working
                setTimeout(() => setAuthorized(true), 1000)
            })
    }, [])

    return <div>
        {!authorized && <SimplePageLayout title="Authorization">
            <div className="text-center">
                Please authorize Albedo to cryptographically sign<br/>server requests on behalf of your Reflector node
                <div className="space">
                    <Button onClick={authorize} style={{width: '50%'}}>Authorize</Button>
                </div>
                {(authorized === false) && <p className="text-center">Authorization failed. Please, check the key you using to login.</p>}
            </div>
        </SimplePageLayout>}
        {authorized ? children : null}
    </div>
})