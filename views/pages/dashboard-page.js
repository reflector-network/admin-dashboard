import React, {useCallback, useEffect, useState} from 'react'
import {useLocation} from 'react-router'
import {setStellarNetwork} from '@stellar-expert/ui-framework'
import {navigation, parseQuery} from '@stellar-expert/navigation'
import {getCurrentConfig} from '../../api/interface'
import SettingsSection from '../components/settings-view'
import NodeStatisticsView from '../components/node-statistics-view'
import UpdateNodeNavigationView from '../components/update-node-navigation-view'
import UpdateRequestVotingView from '../components/update-request-voting-view'

export default function DashboardPage() {
    const [configuration, setConfiguration] = useState()
    const location = useLocation()
    const {reload: loaded} = parseQuery(location.search)
    navigation.updateQuery({reload: undefined})

    const updateConfig = useCallback(() => {
        getCurrentConfig()
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                //redirect to server configuration file if configuration doesn't exist
                if (!res.currentConfig && !res.pendingConfig)
                    return navigation.navigate('/config')
                setConfiguration(res)
                //hide information when update will be completed
                if (res?.pendingConfig?.config.status === 'pending') {
                    const now = new Date().getTime()
                    const timeToApply = res.pendingConfig.config.timestamp - now
                    if (timeToApply > 0)
                        setTimeout(() => {
                            updateConfig()
                            notify({type: 'success', message: 'New configuration is applied'})
                        }, timeToApply)
                }
                //set global network
                setStellarNetwork(res.currentConfig?.config.config.network)
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to get configuration'}))
    }, [])

    //getting actual configuration after the upgrade
    useEffect(() => {
        if (!loaded)
            updateConfig()
    }, [loaded, updateConfig])

    if (!configuration)
        return <div className="loader"/>

    return <div>
        <div className="row relative" style={{zIndex: '1'}}>
            <div className="column column-25">
                <div className="segment" style={{minHeight: '50vh'}}>
                    <UpdateNodeNavigationView configuration={configuration}/>
                </div>
                <div className="space mobile-only"/>
            </div>
            <div className="column column-75">
                <div className="flex-column h-100">
                    {!!configuration && <UpdateRequestVotingView configuration={configuration}/>}
                    <SettingsSection configuration={configuration}/>
                </div>
            </div>
        </div>
        <div className="space">
            <NodeStatisticsView/>
        </div>
    </div>
}