import React, {useCallback, useEffect, useState} from 'react'
import {getGatewaysInfo, updateGatewaysInfo} from '../../api/interface'
import ConfigLayout from '../server-config/config-layout'
import GatewayListView from './gateway-list-ivew'
import InitGatewaysConfigView from './init-gateways-config-view'
import GatewaysDescription from './gateways-description-view'

export default function GatewaysView() {
    const [gateways, setGateways] = useState()
    const [challenge, setChallenge] = useState()
    const [noConfig, setNoConfig] = useState(false)
    const [_, loadGateways] = useState(0)
    useEffect(() => {
        getGatewaysInfo()
            .then(res => {
                setGateways(res.urls || [])
                setChallenge(res.challenge)
            })
            .catch(e => {
                console.error(e)
                notify({type: 'error', message: 'Failed to load gateway configuration'})
                setNoConfig(true)
            })
    }, [_])

    const updateGateways = useCallback(newGateways => {
        updateGatewaysInfo({challenge, urls: newGateways})
            .then(() => {
                notify({type: 'success', message: 'Gateways configuration updated'})
                loadGateways(new Date().getTime())
            })
            .catch(() => {
                notify({type: 'error', message: 'Failed to update gateways configuration'})
            })
    }, [challenge, gateways])

    return <ConfigLayout title="Node gateways" description={<GatewaysDescription/>}>
        {noConfig ?
            <InitGatewaysConfigView/> :
            <GatewayListView gateways={gateways} challenge={challenge} updateGateways={updateGateways}/>}
    </ConfigLayout>
}
