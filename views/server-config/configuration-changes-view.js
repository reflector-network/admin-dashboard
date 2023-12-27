import React, {useEffect, useState} from 'react'
import {AccountAddress, UtcTimestamp} from '@stellar-expert/ui-framework'
import {shortenString} from '@stellar-expert/formatter'
import configChangesDetector from '../util/config-changes-detector'
import {AssetCodeView} from './add-assets-view'

export default function ConfigurationChangesView({configuration}) {
    const [changedData, setChangedData] = useState([])

    useEffect(() => {
        if (!configuration?.pendingConfig)
            return setChangedData([])

        const pendingConfig = configuration.pendingConfig.config.config
        const currentConfig = configuration.currentConfig.config.config
        setChangedData(configChangesDetector(pendingConfig, currentConfig))
        //hide information when update will be completed
        if (configuration.pendingConfig.status === 'pending') {
            const now = new Date().getTime()
            setTimeout(() => {
                setChangedData([])
            }, pendingConfig.timestamp - now)
        }
    }, [configuration])

    return <div className="segment blank h-100">
        <div>
            <h3>Pending quorum upgrade</h3>
            <hr className="flare"/>
            {changedData.length ?
                <div className="space">
                    {changedData.map(data => <ChangesRecordLayout key={data.type} data={data}/>)}
                    <hr className="double-space"/>
                    <div className="text-right">
                        <span className="dimmed">Changes will be applied:</span>&nbsp;
                        <UtcTimestamp date={configuration.pendingConfig?.timestamp || 0}/>
                    </div>
                </div> :
                <div className="double-space text-center">There are no pending updates</div>}
        </div>
    </div>
}


function ChangesRecordLayout({data}) {
    switch (data.type) {
        case 'contract':
            return <div className="space">
                <span className="dimmed micro-space">{data.action} contract&nbsp;
                    <span title={data.contract}>{shortenString(data.contract)}</span>:&emsp;</span>
                <div style={{padding: '0.3em 1em'}}>
                    {data.action === 'Changed' ?
                        data.changes.map(property => {
                            const contract = {[property.type]: property.changes}
                            return <div key={data.contract + property.type}>
                                <ContractRecordlayout property={property.type} contract={contract}/>
                            </div>
                        }) :
                        Object.keys(data.changes).map(property => <div key={data.contract + property}>
                            <ContractRecordlayout property={property} contract={data.changes}/>
                        </div>)}
                </div>
            </div>
        case 'period':
            return <div className="space">
                <span className="dimmed micro-space">Changed period:&emsp;</span>
                <span className="text-small">
                    {data.changes} <span className="dimmed">milliseconds</span>
                </span>
            </div>
        case 'assets':
            return <div className="space">
                <div className="dimmed micro-space">{data.action} assets:</div>
                {data.changes.map(asset => <div key={asset.code} className="text-small">
                    <AssetCodeView asset={asset}/>
                </div>)}
            </div>
        case 'nodes':
            return <div className="space">
                <div className="dimmed micro-space">{data.action} node:</div>
                {data.changes.map(node => <div key={node.pubkey}>
                    <div className="text-small word-break">
                        <i className="icon-hexagon-dice color-success"/>
                        <AccountAddress account={node.pubkey} char={16}/>
                    </div>
                    {!!node.url && <div className="dimmed text-small">&emsp;&emsp;{node.url}</div>}
                    {!!node.domain && <div className="dimmed text-small">&emsp;&emsp;{node.domain}</div>}
                </div>)}
            </div>
        case 'wasmHash':
            return <div className="space">
                <span className="dimmed micro-space">Changed wasmHash:</span>
                <span className="text-small word-break">
                    {data.changes}
                </span>
            </div>
        default: return <></>
    }
}

function ContractRecordlayout({property, contract}) {
    switch (property) {
        case 'assets':
            return <div>
                <span className="dimmed">{property}: </span>
                {contract[property]?.map(asset =>
                    <div key={asset.code} className="text-small" style={{padding: '0.3em 1em'}}>
                        <AssetCodeView asset={asset}/></div>)}
            </div>
        case 'baseAsset':
            return <div>
                <span className="dimmed">{property}: </span>
                <span key={contract[property].code} className="text-small">
                    <AssetCodeView asset={contract[property]}/>
                </span>
            </div>
            
        case 'oracleId':
            return <div>
                <span className="dimmed micro-space">{property}: </span>
                <span title={contract[property]}>{shortenString(contract[property])}</span>
            </div>
        case 'admin':
            return <div>
                <span className="dimmed micro-space">{property}: </span>
                <AccountAddress account={contract[property]}/>
            </div>
        default:
            return <div>
                <span className="dimmed micro-space">{property}: </span>
                <span className="text-small word-break">
                    {contract[property]}
                </span>
            </div>
    }
}