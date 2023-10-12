import React, {useEffect, useState} from 'react'
import {observer} from 'mobx-react-lite'
import {runInAction} from 'mobx'
import {AccountAddress, UtcTimestamp, CopyToClipboard} from '@stellar-expert/ui-framework'
import {getUpdate} from '../../api/interface'
import {AssetCodeView} from '../server-config/add-assets-view'

export default observer(function ConfigChangesView({settings}) {
    const [isDisplayed, setIsDisplayed] = useState(false)
    const [action, setAction] = useState()
    const encodedData = settings.submittedUpdate ? encodeURIComponent(JSON.stringify(settings.submittedUpdate)) : ''
    const link = window.location.href.split('?')[0] + '?section=' + action + '&update=' + encodedData

    useEffect(() => {
        setTimeout(() => {
            getUpdate()
                .then(pendingUpdate => {
                    if (pendingUpdate.error)
                        throw new Error(pendingUpdate.error)
                    runInAction(() => {
                        settings.submittedUpdate = pendingUpdate
                    })
                })
                .catch((error) => {
                    runInAction(() => {
                        settings.submittedUpdate = null
                    })
                })
        }, 300)
    }, [settings])

    useEffect(() => {
        if (!settings.submittedUpdate)
            return

        const now = new Date().getTime()
        setAction(actionDetector(settings.submittedUpdate))
        setIsDisplayed(true)
        //hide information when update will be completed
        setTimeout(() => {
            setIsDisplayed(false)
            runInAction(() => settings.submittedUpdate = null)
        }, settings.submittedUpdate.timestamp - now)
    }, [settings, settings.submittedUpdate])

    //hide information if update didn't submit at least once
    if (!isDisplayed || !settings.submittedUpdate)
        return <></>

    return <div className="double-space">
        <a href={link} target="_blank" rel="noreferrer">Update link</a> <CopyToClipboard text={link}/>
        <div className="dimmed micro-space">Changes will be applied:</div>
        <div className="text-small"><UtcTimestamp date={settings.submittedUpdate?.timestamp || 0}/></div>
        <ChangesRecordLayout data={settings.submittedUpdate} action={action}/>
    </div>
})

function actionDetector(data) {
    if (data?.period)
        return 'timeframe'
    if (data?.assets)
        return 'assets'
    if (data?.nodes)
        return 'nodes'
    if (data?.wasmHash)
        return 'contract'

    return
}

function ChangesRecordLayout({action, data}) {
    switch (action) {
        case 'timeframe':
            return <div>
                <div className="dimmed micro-space">Changed period:</div>
                <div className="text-small">
                    {data.period} <span className="dimmed">milliseconds</span>
                </div>
            </div>
        case 'assets':
            return <div>
                <div className="dimmed micro-space">Added assets:</div>
                {data.assets.map(asset => <div key={asset.code} className="text-small">
                    <AssetCodeView asset={asset}/>
                </div>)}
            </div>
        case 'nodes':
            return <div>
                <div className="dimmed micro-space">{data.nodes[0].remove ? 'Removed node' : 'Added/Edited node'}:</div>
                <div className="text-small">
                    <i className="icon-hexagon-dice color-success"/>
                    <AccountAddress account={data.nodes[0].pubkey} chars={16} link={false}/>
                </div>
                <div className="dimmed text-small">&emsp;&emsp;{data.nodes[0].url}</div>
            </div>
        case 'contract':
            return <div>
                <div className="dimmed micro-space">Hash of the new contract:</div>
                <div className="text-small word-break">
                    {data.wasmHash}
                </div>
            </div>
        default: return <></>
    }
}