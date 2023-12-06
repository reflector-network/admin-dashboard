import React, {useEffect, useState} from 'react'
import {getCurrentConfig} from '../../api/interface'
import SettingsSection from '../components/settings-view'
import NodeStatisticsView from '../components/node-statistics-view'
import UpdateNodeNavigationView from '../components/update-node-navigation-view'
import ConfigChangesView from '../components/config-changes-view'
import UpdateRequestVotingView from '../components/update-request-voting-view'

function configFormatter(config) {
    if (!config)
        return
    const contracts = {}
    config.contracts?.forEach(contract => contracts[contract.admin] = contract)
    return {...config, contracts}
}

export default function DashboardPage() {
    const [configuration, setConfiguration] = useState()

    useEffect(() => {
        getCurrentConfig()
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                //TODO:change server configuration with correct format
                const formattedConfig = configFormatter(res.currentConfig.config)
                setConfiguration({...res, currentConfig: {...res.currentConfig, config: formattedConfig}})
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to update data'}))
    }, [])

    if (!configuration)
        return <div className="loader"/>

    return <div>
        <div className="row">
            <div className="column column-25">
                <div className="segment" style={{minHeight: '50vh'}}>
                    <UpdateNodeNavigationView contracts={configuration.currentConfig.config.contracts}/>
                    {/* <ConfigChangesView settings={settings}/> */}
                </div>
                <div className="space mobile-only"/>
            </div>
            <div className="column column-75">
                <div className="flex-column h-100">
                    {!!configuration && <UpdateRequestVotingView pendingSettings={configuration.pendingConfig}/>}
                    <SettingsSection settings={configuration.currentConfig}/>
                </div>
            </div>
        </div>
        <div className="space">
            {/* <NodeStatisticsView/> */}
        </div>
    </div>
}