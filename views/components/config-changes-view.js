import React, {useEffect, useState} from 'react'
import {observer} from 'mobx-react-lite'
import {runInAction} from 'mobx'
import {AccountAddress, AssetLink, UtcTimestamp} from '@stellar-expert/ui-framework'
import {getUpdate} from '../../api/interface'

export default observer(function ConfigChangesView({settings}) {
    const [isDisplayed, setIsDisplayed] = useState(false)

    useEffect(() => {
        getUpdate()
            .then(pendingUpdate => {
                if (pendingUpdate.error)
                    throw new Error(pendingUpdate.error)
                runInAction(() => {
                    settings.updateSubmitted = pendingUpdate
                })
            })
            .catch((error) => {
                runInAction(() => {
                    settings.updateSubmitted = null
                })
            })
    }, [settings])

    useEffect(() => setIsDisplayed(!!settings.updateSubmitted), [settings.updateSubmitted])

    //hide information if update didn't submit at least once
    if (!isDisplayed)
        return <></>

    return <div className="double-space">
        <h3 className="dimmed">Changes will be applied:</h3>
        <div className="text-small">&emsp;<UtcTimestamp date={settings.updateSubmitted.timestamp}/></div>
        <AnalysisChangesLayout data={settings.updateSubmitted}/>
    </div>
})

function AnalysisChangesLayout({data}) {
    if (data?.period) {
        return <div>
            <h3 className="dimmed">Changed period: </h3>
            <div className="text-small">
                &ensp;{data.period} <span className="dimmed">milliseconds</span>
            </div>
        </div>
    }
    if (data?.assets) {
        return <div>
            <h3 className="dimmed">Added assets: </h3>
            {data.assets.map(({type, code}) => <div key={code} className="text-small">
                &ensp;{type === 1 ?
                    <AssetLink asset={code}/> :
                    <b>{code}</b>}
            </div>)}
        </div>
    }
    if (data?.nodes) {
        const title = data.nodes[0].remove ? 'Removed node' : 'Added/Edited node'
        return <div>
            <h3 className="dimmed">{title}: </h3>
            <div className="text-small">
                &emsp;<i className="icon-hexagon-dice color-success"/>
                <AccountAddress account={data.nodes[0].pubkey} chars={16} link={false}/>
            </div>
            <div className="dimmed text-small">&emsp;&emsp;{data.nodes[0].url}</div>
        </div>
    }
}