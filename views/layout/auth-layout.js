import React, {useCallback} from 'react'
import {observer} from 'mobx-react'
import {Button} from '@stellar-expert/ui-framework'
import {requestAlbedoSession} from '../../providers/albedo-provider'
import clientStatus from '../../state/client-status'
import SimplePageLayout from './simple-page-layout'

export default observer(function AuthLayout({children}) {
    const authorize = useCallback(() => {
        requestAlbedoSession()
            .then(authorized => authorized && clientStatus.pollSession())
    }, [])

    if (!clientStatus.hasSession || !clientStatus.isMatchingKey) //show auth request
        return <SimplePageLayout title="Authorization">
            <div className="text-center">
                Please authorize Albedo to cryptographically sign<br/>server requests on behalf of your Reflector node
                <div className="space">
                    <Button onClick={authorize} style={{width: '50%'}}>Authorize</Button>
                </div>
            </div>
        </SimplePageLayout>
    //show content
    return children
})