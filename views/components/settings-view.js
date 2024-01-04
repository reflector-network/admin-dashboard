import React from 'react'
import {useLocation} from 'react-router'
import {parseQuery} from '@stellar-expert/navigation'
import UpdateNodeView from '../server-config/update-node-view'
import AddAssetsView from '../server-config/add-assets-view'
import UpdatePeriodView from '../server-config/update-period-view'
import UpdateContractView from '../server-config/update-contract-view'
import ConfigurationChangesView from '../server-config/configuration-changes-view'
import ConfigurationHistoryView from './configuration-history-view'
import ConfigurationLogsView from './server-logs-view'

export default function SettingsSectionView({configuration}) {
    const location = useLocation()
    const {section = 'about', contract} = parseQuery(location.search)

    if (!configuration.currentConfig)
        return <AboutSectionView/>

    //reset settings for each opened section
    const settings = {
        description: '',
        expirationDate: '',
        timestamp: '',
        config: {...configuration.currentConfig.config.config, minDate: ''}
    }

    switch (section) {
        case 'nodes':
            return <UpdateNodeView settings={settings}/>
        case 'assets':
            return <AddAssetsView settings={settings} contractId={contract}/>
        case 'period':
            return <UpdatePeriodView settings={settings} contractId={contract}/>
        case 'contract':
            return <UpdateContractView settings={settings}/>
        case 'upgrade':
            return <ConfigurationChangesView configuration={configuration}/>
        case 'history':
            return <ConfigurationHistoryView/>
        case 'logs':
            return <ConfigurationLogsView/>
        default:
            return <AboutSectionView/>
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
                    Here you can manage your node, vote for adding peers to the quorum set, add assets to the oracle and change
                    basic settings.
                </p>
            </div>
        </div>
    </div>
}