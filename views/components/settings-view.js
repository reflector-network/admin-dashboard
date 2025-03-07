import React from 'react'
import {useLocation} from 'react-router'
import {parseQuery} from '@stellar-expert/navigation'
import UpdateNodeView from '../server-config/nodes/update-node-view'
import AddAssetsView from '../server-config/oracles/add-assets-view'
import UpdatePeriodView from '../server-config/oracles/update-period-view'
import ConfigurationChangesView from '../server-config/changes/configuration-changes-view'
import UpdateBaseFeeView from '../server-config/subscriptions/update-base-fee-view'
import ConfigurationHistoryView from './configuration-history-view'
import ConfigurationLogsView from './server-logs-view'
import NotificationSettingsView from './notification-settings-view'
import GatewaysView from '../gateway/gateways-view'

export default function SettingsSectionView({configuration}) {
    const location = useLocation()
    const {section = 'about', contract} = parseQuery(location.search)

    if (!configuration.currentConfig)
        return <AboutSectionView/>

    //reset settings for each opened section
    const settings = {
        description: '',
        expirationDate: '',
        timestamp: 0,
        config: {...configuration.currentConfig.config.config, minDate: 0}
    }

    switch (section) {
        case 'assets':
            return <AddAssetsView settings={settings} contractId={contract}/>
        case 'period':
            return <UpdatePeriodView settings={settings} contractId={contract}/>
        case 'baseFee':
            return <UpdateBaseFeeView settings={settings} contractId={contract}/>
        case 'upgrade':
            return <ConfigurationChangesView configuration={configuration}/>
        case 'history':
            return <ConfigurationHistoryView/>
        case 'logs':
            return <ConfigurationLogsView/>
        case 'notification':
            return <NotificationSettingsView/>
        case 'gateways':
            return <GatewaysView/>
        case 'nodes':
        default:
            return <UpdateNodeView settings={settings}/>
    }
}

function AboutSectionView() {
    return <div className="segment blank h-100">
        <div>
            <h3>About</h3>
            <hr className="flare"/>
            <div className="space">
                Welcome to the Reflector node dashboard.
                <p>
                    Here you can manage your node, vote for DAO decisions, add assets to the oracle and adjust cluster settings.
                </p>
            </div>
        </div>
    </div>
}