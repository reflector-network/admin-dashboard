import React from 'react'
import {useLocation} from 'react-router'
import {parseQuery} from '@stellar-expert/navigation'
import {AccountAddress} from '@stellar-expert/ui-framework'

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
    {name: 'assets', title: 'Tracked assets', type: 'oracle'},
    {name: 'period', title: 'Retention period', type: 'oracle'},
    {name: 'baseFee', title: 'Base fee', type: 'subscriptions'}
]

export default function UpdateNodeNavigationView({configuration}) {
    const location = useLocation()
    const {section: activeSection = allSections[0].name, contract: currentContract} = parseQuery(location.search)
    const contracts = configuration.currentConfig?.config.config.contracts || {}

    if (!configuration.currentConfig)
        return <span style={{padding: '0.3em 0'}}>
            <i className="icon-angle-double-right"/>{allSections[0].title}
        </span>

    return <ul style={{margin: 0}}>
        {allSections.map(section => <li key={section.name} style={{padding: '0.3em 0'}}>
            {section.hasChild ? Object.keys(contracts || []).map(contract => {
                    const type = contracts[contract].type || 'oracle'
                    const list = contractSections.filter(item => item.type === type)
                    return <span key={contract}>
                    {resolveTitle(contracts[contract].type)} <AccountAddress account={contract} className="condensed"/>
                    <ul key={contract} style={{margin: '0.3em 1em'}}>
                        {list.map(subSection => <li key={subSection.name + contract} style={{padding: '0.3em 0'}}>
                            {(subSection.name === activeSection && currentContract === contract) ?
                                <NavigationItemView title={subSection.title}/> :
                                <NavigationItemView title={subSection.title}
                                                    link={'/?section=' + subSection.name + '&contract=' + contract}/>}
                        </li>)}
                    </ul>
                </span>
                }) :
                (section.name === activeSection ?
                    <NavigationItemView title={section.title}/> :
                    <NavigationItemView title={section.title} link={'/?section=' + section.name}/>)}
        </li>)}
    </ul>
}

function resolveTitle(type) {
    switch (type) {
        case 'subscriptions':
            return 'Subscriptions'
        case 'dao':
            return 'DAO'
        default:
            return 'Oracle'
    }
}

function NavigationItemView({title, link}) {
    if (link)
        return <a href={link}>{title}</a>
    return <span><i className="icon-angle-double-right"/>{title}</span>
}