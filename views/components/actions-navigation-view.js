import React, {useCallback, useState} from 'react'
import {useLocation} from 'react-router'
import {parseQuery} from '@stellar-expert/navigation'
import {Button, CopyToClipboard} from '@stellar-expert/ui-framework'
import {resetNode} from '../../api/config'
import {getConfig} from '../../api/interface'

export const allSections = [
    {name: 'about', title: 'About'},
    {name: 'nodes', title: 'Peer nodes'},
    {name: 'assets', title: 'Tracked assets'},
    {name: 'timeframe', title: 'Retention period'}
]

export default function UpdateNodeNavigationView() {
    const location = useLocation()
    const {section: activeSection = allSections[0].name} = parseQuery(location.search)
    const [configLink, setConfigLink] = useState()

    const createLink = useCallback(currentConfig => {
        const encodedData = encodeURIComponent(JSON.stringify(currentConfig))
        const nodeApiUrl = window.location.origin
        const link = nodeApiUrl + '/config?update=' + encodedData
        setConfigLink(link)
    }, [])

    const generateConfigLink = useCallback(() => {
        getConfig()
            .then(currentConfig => createLink(currentConfig))
            .catch(({error}) => notify({type: 'error', message: error?.message || "Failed to load config"}))
    }, [createLink])


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
        <div className="double-space">
            {!configLink ?
                <Button onClick={generateConfigLink} className="button-block">Generate config link</Button> :
                <CopyToClipboard text={configLink}><Button className="button-block">Copy config link</Button></CopyToClipboard>}
            <Button onClick={resetNode} className="space button-block">
                <span className="text-overflow nowrap block">
                    Connect to another Reflector node</span>
            </Button>
        </div>
    </>
}