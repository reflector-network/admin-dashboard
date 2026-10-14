import React, {useCallback, useEffect, useState} from 'react'
import {getGatewaysInfo, updateGatewaysInfo} from '../../api/interface'
import ConfigLayout from '../server-config/config-layout'
import GatewayListView from './gateway-list-ivew'
import InitGatewaysConfigView from './init-gateways-config-view'
import GatewaysDescription from './gateways-description-view'
import {describeUnusable, readGatewaysFailure, readGatewaysState} from './gateway-state.mjs'

export default function GatewaysView() {
    const [gateways, setGateways] = useState()
    const [challenge, setChallenge] = useState()
    const [noConfig, setNoConfig] = useState(false)
    const [unusable, setUnusable] = useState(false)
    const [loadError, setLoadError] = useState(null)
    const [_, loadGateways] = useState(0)
    useEffect(() => {
        getGatewaysInfo()
            .then(res => {
                const state = readGatewaysState(res)
                setGateways(state.gateways)
                setChallenge(state.challenge)
                setUnusable(state.unusable)
                setNoConfig(state.noConfig)
                setLoadError(null)
                //the setup screen keeps its temporary challenge in localStorage
                if (!state.noConfig)
                    localStorage.removeItem('tmp_challenge')
            })
            .catch(e => {
                console.error(e)
                //a refusal, for example a node that is not connected, is not a missing config: it never leads to setup
                const failure = readGatewaysFailure(e)
                notify({type: 'error', message: 'Failed to load gateway configuration. ' + failure.loadError})
                setNoConfig(failure.noConfig)
                setUnusable(false)
                setLoadError(failure.loadError)
            })
    }, [_])

    const updateGateways = useCallback(newGateways => {
        updateGatewaysInfo({challenge, urls: newGateways})
            .then(() => {
                notify({type: 'success', message: 'Gateways configuration updated'})
                loadGateways(new Date().getTime())
            })
            .catch(e => {
                notify({type: 'error', message: 'Failed to update gateways configuration. ' + (e?.message || '')})
            })
    }, [challenge, gateways])

    const retryLoad = useCallback(() => loadGateways(new Date().getTime()), [])

    const unusableWarning = describeUnusable({gateways, unusable})

    return <ConfigLayout title="Node gateways" description={<GatewaysDescription/>}>
        {!!unusableWarning && <div className="segment warning space">{unusableWarning}</div>}
        {loadError ?
            <div className="segment error space">
                <h3>Could not load the gateway configuration</h3>
                <div className="space text-small">{loadError}</div>
                <div className="space"><a href="#" onClick={retryLoad}>Retry</a></div>
            </div> :
            noConfig ?
                <InitGatewaysConfigView/> :
                <GatewayListView gateways={gateways} challenge={challenge} updateGateways={updateGateways}/>}
    </ConfigLayout>
}
