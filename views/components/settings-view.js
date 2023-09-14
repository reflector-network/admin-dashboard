import React, {useEffect, useMemo} from 'react'
import {observer} from 'mobx-react'
import {runInAction} from 'mobx'
import NodeSettings, {UPDATE_ASSETS, UPDATE_NODES, UPDATE_PERIOD} from '../server-config/node-settings'
import UpdateNodeView from '../server-config/update-node-view'
import AddAssetsView from '../server-config/add-assets-view'
import UpdatePeriodView from '../server-config/update-period-view'
import ConfigSharingSectionView from '../server-config/config-sharing-section-view'

export default observer(function SettingsSectionView({sectionName}) {
    const settings = useMemo(() => new NodeSettings(), [])
    runInAction(() => {
        settings.isFinalized = false
        settings.updateData = null
    })

    useEffect(() => {
        setTimeout(() => settings.fetchSettings(), 400)
    }, [settings, sectionName])

    switch (sectionName) {
        case 'nodes':
            settings.action = UPDATE_NODES
            return <UpdateNodeView settings={settings}/>
        case 'assets':
            settings.action = UPDATE_ASSETS
            return <AddAssetsView settings={settings}/>
        case 'timeframe':
            settings.action = UPDATE_PERIOD
            return <UpdatePeriodView settings={settings}/>
        case 'share-config':
            return <ConfigSharingSectionView/>
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
})