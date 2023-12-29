import React from 'react'
import {useLocation} from 'react-router'
import {parseQuery} from '@stellar-expert/navigation'
import {shortenString} from '@stellar-expert/formatter'

const allSections = [
    {name: 'about', title: 'About'},
    {name: 'nodes', title: 'Peer nodes'},
    // {name: 'contract', title: 'Update contract'},
    {name: 'contracts', hasChild: true},
    {name: 'upgrade', title: 'Quorum upgrade'},
    {name: 'history', title: 'History'}
]

const contractSections = [
    {name: 'assets', title: 'Tracked assets'},
    {name: 'period', title: 'Retention period'}
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
            {section.hasChild ? Object.keys(contracts || []).map(contract => <>
                <span title={contract}>{shortenString(contract)}</span>
                <ul key={contract} style={{margin: '0.3em 1em'}}>
                    {contractSections.map(subSection => <li key={subSection.name + contract} style={{padding: '0.3em 0'}}>
                        {(subSection.name === activeSection && currentContract === contract) ?
                            <span><i className="icon-angle-double-right"/>{subSection.title}</span> :
                            <a href={'/?section=' + subSection.name + '&contract=' + contract}>
                                {subSection.title}</a>}
                    </li>)}
                </ul>
            </>) :
            (section.name === activeSection ?
                <span><i className="icon-angle-double-right"/>{section.title}</span> :
                <a href={'/?section=' + section.name}>{section.title}</a>)}
        </li>)}
    </ul>
}