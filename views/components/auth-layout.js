import React, {useCallback, useEffect, useState} from 'react'
import {Button} from '@stellar-expert/ui-framework'
import {checkAlbedoSession, requestAlbedoSession} from '../util/albedo-provider'
import SimplePageLayout from './simple-page-layout'

export default function AuthLayout({children}) {
    const [_, forceRefresh] = useState(0)
    const authorize = useCallback(() => {
        requestAlbedoSession()
            .then(() => forceRefresh(new Date().getTime()))
    }, [])
    //periodically check session status
    useEffect(() => {
        const pingIntervalHandler = setInterval(() => {
            //force refresh the page if Albedo is not connected
            if (!checkAlbedoSession()) {
                forceRefresh(new Date().getTime())
            }
            return () => clearInterval(pingIntervalHandler)
        }, 10_000)
    }, [])

    if (!checkAlbedoSession()) //show auth request
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
}