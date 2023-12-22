import React, {useEffect, useState} from 'react'
import {setStellarNetwork} from '@stellar-expert/ui-framework'
import {navigation} from '@stellar-expert/navigation'
import {getCurrentConfig} from '../../api/interface'
import SettingsSection from '../components/settings-view'
import NodeStatisticsView from '../components/node-statistics-view'
import UpdateNodeNavigationView from '../components/update-node-navigation-view'
import UpdateRequestVotingView from '../components/update-request-voting-view'

export default function DashboardPage() {
    const [configuration, setConfiguration] = useState()

    useEffect(() => {
        getCurrentConfig()
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                //redirect to server configuration file if currentConfig doesn't exist
                if (!res.currentConfig)
                    return navigation.navigate('/config')
                setConfiguration(res)
                //set global network
                setStellarNetwork(res.currentConfig.config.config.network)
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to get configuration'}))
    }, [])

    if (!configuration)
        return <div className="loader"/>

    return <div>
        <div className="row">
            <div className="column column-25">
                <div className="segment" style={{minHeight: '50vh'}}>
                    <UpdateNodeNavigationView contracts={configuration.currentConfig.config.config.contracts}/>
                </div>
                <div className="space mobile-only"/>
            </div>
            <div className="column column-75">
                <div className="flex-column h-100">
                    {!!configuration?.pendingConfig && <UpdateRequestVotingView pendingSettings={configuration.pendingConfig.config}/>}
                    <SettingsSection configuration={configuration}/>
                </div>
            </div>
        </div>
        <div className="space">
            {/* <NodeStatisticsView/> */}
        </div>
    </div>
}