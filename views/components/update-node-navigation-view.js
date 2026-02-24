import React from 'react'
import {useLocation} from 'react-router'
import {parseQuery} from '@stellar-expert/navigation'
import {AccountAddress} from '@stellar-expert/ui-framework'
import {MenuNavLink} from './nav-item'

const allSections = [
    {name: 'nodes', title: 'Cluster nodes'},
    {name: 'contracts', hasChild: true},
    {name: 'gateways', title: 'Gateway servers'},
    {name: 'upgrade', title: 'Pending updates'},
    {name: 'history', title: 'Changes history'},
    {name: 'logs', title: 'Server logs'},
    {name: 'notification', title: 'Notifications'}
]

const contractSections = [
    {name: 'assets', title: 'Tracked assets', types: ['oracle', 'oracle_beam']},
    {name: 'period', title: 'Retention period', types: ['oracle', 'oracle_beam']},
    {name: 'baseFee', title: 'Base fee', types: ['subscriptions']}
]

export default function UpdateNodeNavigationView({configuration}) {
    const location = useLocation()
    const {section: activeSection = allSections[0].name, contract: currentContract} = parseQuery(location.search)
    if (!configuration.currentConfig)
        return <span style={{padding: '0.3em 0'}}>
            <i className="icon-angle-double-right"/>{allSections[0].title}
        </span>
    const contracts = configuration.currentConfig.config.config.contracts || {}

    return <ul style={{margin: 0}}>
        {allSections.map(section => <li key={section.name} style={{padding: '0.3em 0'}}>
            {section.hasChild ? Object.keys(contracts || []).map(contract => {
                    const type = contracts[contract].type || 'oracle'
                    const list = contractSections.filter(item => item.types.includes(type))
                    return <span key={contract} className="text-small">
                        <span className="dimmed">{resolveTitle(contracts[contract].type)}</span> <AccountAddress account={contract} className="condensed"/>
                        <ul key={contract} style={{margin: '0.3em 1em'}}>
                            {list.map(subSection => <li key={subSection.name + contract} style={{padding: '0'}}>
                                {(subSection.name === activeSection && currentContract === contract) ?
                                    <MenuNavLink title={subSection.title} sub/> :
                                    <MenuNavLink title={subSection.title} sub
                                                 link={'/?section=' + subSection.name + '&contract=' + contract}/>}
                            </li>)}
                        </ul>
                    </span>
                }) :
                (section.name === activeSection ?
                    <MenuNavLink title={section.title}/> :
                    <MenuNavLink title={section.title} link={'/?section=' + section.name}/>)}
        </li>)}
    </ul>
}

function resolveTitle(type) {
    switch (type) {
    case 'subscriptions':
        return 'Subscriptions'
    case 'dao':
        return 'DAO'
    case 'oracle_beam':
        return 'BeamOracle'
    default:
        return 'PulseOracle'
    }
}