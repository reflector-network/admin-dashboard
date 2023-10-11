import React from 'react'
import {useLocation} from 'react-router'
import {parseQuery} from '@stellar-expert/navigation'

export const allSections = [
    {name: 'about', title: 'About'},
    {name: 'nodes', title: 'Peer nodes'},
    {name: 'assets', title: 'Tracked assets'},
    {name: 'timeframe', title: 'Retention period'},
    {name: 'contract', title: 'Update contract'},
    {name: 'share-config', title: 'Share config'}
]

export default function UpdateNodeNavigationView() {
    const location = useLocation()
    const {section: activeSection = allSections[0].name} = parseQuery(location.search)

    return <>
        <ul style={{margin: 0}}>
            {allSections.map(section => {
                const title = section.title || allSections[0].title
                return <li key={section.name} style={{padding: '0.3em 0'}}>
                    {section.name === activeSection ?
                        <span><i className="icon-angle-double-right"/>{title}</span> :
                        <a href={'/?section=' + section.name}>{title}</a>
                    }
                </li>
            })}
        </ul>
    </>
}