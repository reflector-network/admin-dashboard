import React, {useEffect, useState} from 'react'
import {setStellarNetwork} from '@stellar-expert/ui-framework'
import {getCurrentConfig} from '../../api/interface'
import SettingsSection from '../components/settings-view'
import NodeStatisticsView from '../components/node-statistics-view'
import UpdateNodeNavigationView from '../components/update-node-navigation-view'
import UpdateRequestVotingView from '../components/update-request-voting-view'

function configFormatter(config) {
    if (!config)
        return
    const contracts = {}
    config.contracts?.forEach(contract => contracts[contract.oracleId] = contract)
    return {...config, contracts}
}

export default function DashboardPage() {
    const [configuration, setConfiguration] = useState()

    useEffect(() => {
        //set global public network
        setStellarNetwork('public')

        getCurrentConfig()
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                //TODO:change server configuration with correct format
                const formattedConfiguration = res
                if (formattedConfiguration?.currentConfig?.config) {
                    formattedConfiguration.currentConfig.config = configFormatter(res.currentConfig.config)
                }
                if (formattedConfiguration?.pendingConfig?.config) {
                    formattedConfiguration.pendingConfig.config = configFormatter(res.pendingConfig.config)
                }
                setConfiguration(formattedConfiguration)
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to get configuration'}))
    }, [])

    if (!configuration)
        return <div className="loader"/>

    return <div>
        <div className="row">
            <div className="column column-25">
                <div className="segment" style={{minHeight: '50vh'}}>
                    <UpdateNodeNavigationView contracts={configuration.currentConfig.config.contracts}/>
                </div>
                <div className="space mobile-only"/>
            </div>
            <div className="column column-75">
                <div className="flex-column h-100">
                    {!!configuration && <UpdateRequestVotingView pendingSettings={configuration.pendingConfig}/>}
                    <SettingsSection configuration={configuration}/>
                </div>
            </div>
        </div>
        <div className="space">
            {/* <NodeStatisticsView/> */}
        </div>
    </div>
}