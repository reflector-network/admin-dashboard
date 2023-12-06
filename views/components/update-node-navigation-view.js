import React from 'react'
import {useLocation} from 'react-router'
import {parseQuery} from '@stellar-expert/navigation'
import {shortenString} from '@stellar-expert/formatter'

export const allSections = [
    {name: 'about', title: 'About'},
    {name: 'nodes', title: 'Peer nodes'},
    {name: 'contract', title: 'Update contract'},
    {name: 'assets', title: 'Tracked assets', hasChild: true},
    {name: 'period', title: 'Retention period', hasChild: true}
]

export default function UpdateNodeNavigationView({contracts}) {
    const location = useLocation()
    const {section: activeSection = allSections[0].name, contract: currentContract} = parseQuery(location.search)

    return <ul style={{margin: 0}}>
        {allSections.map(section => {
            const title = section.title || allSections[0].title
            return <li key={section.name} style={{padding: '0.3em 0'}}>
                {section.hasChild ? <>
                    <span>{title}</span>
                    <ul style={{margin: '0 0.6em'}}>
                        {Object.keys(contracts || []).map(contract => <li key={contract} style={{padding: '0.15em 0'}}>
                            {(contract === currentContract && section.name === activeSection) ?
                                <span><i className="icon-angle-double-right"/>{shortenString(contract)}</span> :
                                <a href={`/?section=${section.name}&contract=${contract}`}>{shortenString(contract)}</a>
                            }
                        </li>)}
                    </ul>
                </> :
                (section.name === activeSection ?
                    <span><i className="icon-angle-double-right"/>{title}</span> :
                    <a href={'/?section=' + section.name}>{title}</a>)}
            </li>
        })}
    </ul>
}