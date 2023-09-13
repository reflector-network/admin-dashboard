import React, {useCallback, useEffect, useState} from 'react'
import {useLocation} from 'react-router'
import {navigation, parseQuery} from '@stellar-expert/navigation'
import {getStatistics} from '../../api/interface'
import Actions from '../components/actions-navigation-view'
import SettingsSection from '../components/settings-view'
import NodeStatisticsView from '../components/node-statistics-view'
import {checkAlbedoSession} from '../util/albedo-provider'

const refreshStatisticsTime = 30 //30 seconds

export default function Dashboard() {
    const [statistics, setStatistics] = useState()
    const location = useLocation()
    const {section = 'about'} = parseQuery(location.search)

    const checkNodeStatus = useCallback(statistics => {
        if (statistics.nodeStatus !== 'Ready')
            return navigation.navigate('/initialization-progress')
        setStatistics(statistics)
    }, [])

    const getStatisticsData = useCallback(() => {
        getStatistics()
            .then(statistics => {
                if (statistics.error)
                    throw new Error(statistics.error)
                checkNodeStatus(statistics)
            })
            .catch((error) => notify({type: 'error', message: 'Failed to get statistics. ' + error?.message || 'Failed to get statistics'}))
    }, [checkNodeStatus])

    useEffect(() => {
        getStatisticsData()
        let refreshStatisticsTimer
        if (checkAlbedoSession()) {
            refreshStatisticsTimer = setInterval(getStatisticsData, refreshStatisticsTime * 1000)
        }
        return () => clearInterval(refreshStatisticsTimer)
    }, [getStatisticsData])

    if (!statistics)
        return <div className="loader"/>
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
            <NodeStatisticsView statistics={statistics}/>
        </div>
    </div>
}