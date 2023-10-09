import React, {useMemo} from 'react'
import {useLocation} from 'react-router'
import {parseQuery} from '@stellar-expert/navigation'
import Actions from '../components/actions-navigation-view'
import SettingsSection from '../components/settings-view'
import NodeStatisticsView from '../components/node-statistics-view'
import NodeSettings from '../server-config/node-settings'
import ConfigChangesView from '../components/config-changes-view'

export default function DashboardPage() {
    const location = useLocation()
    const {section = 'about'} = parseQuery(location.search)
    const settings = useMemo(() => new NodeSettings(), [])

    /*if (nodeStatus.status !== 'ready')
        return <div className="loader"/>*/
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
}