import React from 'react'
import {useLocation} from 'react-router'
import {parseQuery} from '@stellar-expert/navigation'
import Actions from '../components/actions-navigation-view'
import SettingsSection from '../components/settings-view'
import NodeStatisticsView from '../components/node-statistics-view'

export default function DashboardPage() {
    const location = useLocation()
    const {section = 'about'} = parseQuery(location.search)

    /*if (nodeStatus.status !== 'ready')
        return <div className="loader"/>*/
    return <div>
        <div className="row">
            <div className="column column-25">
                <div className="segment" style={{minHeight: '50vh'}}>
                    <Actions/>
                </div>
                <div className="space mobile-only"/>
            </div>
            <div className="column column-75">
                <SettingsSection sectionName={section}/>
            </div>
        </div>
        <div className="space">
            <NodeStatisticsView/>
        </div>
    </div>
}