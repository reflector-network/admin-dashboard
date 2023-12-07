import React, {useEffect, useState} from 'react'
import {AccountAddress, UtcTimestamp} from '@stellar-expert/ui-framework'
import {shortenString} from '@stellar-expert/formatter'
import {AssetCodeView} from '../server-config/add-assets-view'
import configChangesDetector from '../util/config-changes-detecor'

export default function ConfigChangesView({configuration}) {
    const [isDisplayed, setIsDisplayed] = useState(false)
    const [changedData, setChangedData] = useState([])

    useEffect(() => {
        if (!configuration?.pendingConfig)
            return

        setChangedData(configChangesDetector(configuration))
        setIsDisplayed(true)
        //hide information when update will be completed
        if (configuration.pendingConfig.status === 'pending') {
            const now = new Date().getTime()
            setTimeout(() => {
                setIsDisplayed(false)
            }, configuration.pendingConfig.timestamp - now)
        }
    }, [configuration])

    if (!isDisplayed)
        return <></>

    return <div className="double-space">
        <div className="dimmed micro-space">Changes will be applied:</div>
        <div className="text-small"><UtcTimestamp date={configuration.pendingConfig?.timestamp || 0}/></div>
        {changedData.map(data => <ChangesRecordLayout key={data.type} data={data}/>)}
    </div>
}


function ChangesRecordLayout({data}) {
    switch (data.type) {
        case 'period':
            return <div>
                <div className="dimmed micro-space">Changed period for <br/> {shortenString(data.contract)}:</div>
                <div className="text-small">
                    {data.changes} <span className="dimmed">milliseconds</span>
                </div>
            </div>
        case 'assets':
            return <div>
                <div className="dimmed micro-space">Added assets for <br/> {shortenString(data.contract)}:</div>
                {data.changes.map(asset => <div key={asset.code} className="text-small">
                    <AssetCodeView asset={asset}/>
                </div>)}
            </div>
        case 'nodes':
            return <div>
                <div className="dimmed micro-space">{data.action} node:</div>
                {data.changes.map(node => <div key={node.pubkey}>
                    <div className="text-small word-break">
                        <i className="icon-hexagon-dice color-success"/>
                        <AccountAddress account={node.pubkey} chars={16} link={false}/>
                    </div>
                    <div className="dimmed text-small">&emsp;&emsp;{node.url}</div>
                </div>)}
            </div>
        case 'wasmHash':
            return <div>
                <div className="dimmed micro-space">Changed wasmHash:</div>
                <div className="text-small word-break">
                    {data.changes}
                </div>
            </div>
        default: return <></>
    }
}