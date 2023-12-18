import React from 'react'
import {useLocation} from 'react-router'
import {parseQuery} from '@stellar-expert/navigation'
import UpdateNodeView from '../server-config/update-node-view'
import AddAssetsView from '../server-config/add-assets-view'
import UpdatePeriodView from '../server-config/update-period-view'
import UpdateContractView from '../server-config/update-contract-view'
import ConfigurationChangesView from '../server-config/configuration-changes-view'
import ConfigurationHistoryView from '../server-config/configuration-history-view'

export default function SettingsSectionView({configuration}) {
    const settings = configuration.currentConfig.config
    const location = useLocation()
    const {section = 'about', contract} = parseQuery(location.search)

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
        default:
            return <div className="segment blank">
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
}