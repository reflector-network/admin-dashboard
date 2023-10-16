import React, {useMemo} from 'react'
import {observer} from 'mobx-react'
import {useLocation} from 'react-router'
import {navigation, parseQuery} from '@stellar-expert/navigation'
import clientStatus from '../../state/client-status'
import updateRequest from '../../state/config-update-request'
import Actions from '../components/actions-navigation-view'
import SettingsSection from '../components/settings-view'
import NodeStatisticsView from '../components/node-statistics-view'
import NodeSettings from '../server-config/node-settings'
import ConfigChangesView from '../components/config-changes-view'


export default observer(function DashboardPage() {
    const location = useLocation()
    const {section = 'about'} = parseQuery(location.search)
    const settings = useMemo(() => new NodeSettings(), [])


    if (clientStatus.status !== 'ready') {
        clientStatus.updateNodeInfo()
        return <div className="loader"/>
    }

    return <div>
        <div className="row">
            <div className="column column-25">
                <div className="segment" style={{minHeight: '50vh'}}>
                    <Actions/>
                    <ConfigChangesView settings={settings}/>
                </div>
                <div className="space mobile-only"/>
            </div>
            <div className="column column-75">
                <SettingsSection settings={settings} sectionName={section}/>
            </div>
        </div>
        <div className="space">
            <NodeStatisticsView/>
        </div>
    </div>
})