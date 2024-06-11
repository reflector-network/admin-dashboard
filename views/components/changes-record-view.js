import React from 'react'
import {AccountAddress} from '@stellar-expert/ui-framework'
import {shortenString} from '@stellar-expert/formatter'
import AssetCodeView from './asset-code-view'

export default function ChangesRecordView({data}) {
    switch (data.type) {
        case 'contract':
            return <div className="space">
                <span className="dimmed micro-space">{data.action} contract&nbsp;
                    <span title={data.uniqId}>{shortenString(data.uniqId)}</span>:&emsp;</span>
                <div style={{padding: '0.3em 1em'}}>
                    {data.action === 'Changed' ?
                        data.changes.map(property => {
                            const changes = {[property.type]: property.changes}
                            return <div key={data.uniqId + property.type + property.action}>
                                <ContractRecordView property={property.type} action={property.action} changes={changes}/>
                            </div>
                        }) :
                        Object.keys(data.changes).map(property => <div key={data.uniqId + property}>
                            <ContractRecordView property={property} changes={data.changes}/>
                        </div>)}
                </div>
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
        default:
            return <div className="space">
                <span className="dimmed micro-space">{data.action} {data.type}: </span>
                <span className="text-small word-break">
                    {data.changes}
                </span>
            </div>
    }
}

function ContractRecordView({property, action, changes}) {
    switch (property) {
        case 'assets':
            return <div>
                <span className="dimmed">{action} {property}: </span>
                {changes[property]?.map(asset =>
                    <div key={asset.code} className="text-small" style={{padding: '0.3em 1em'}}>
                        <AssetCodeView asset={asset}/></div>)}
            </div>
        case 'baseAsset':
            return <div>
                <span className="dimmed">{property}: </span>
                <span key={changes[property].code} className="text-small">
                    <AssetCodeView asset={changes[property]}/>
                </span>
            </div>
        case 'oracleId':
            return <div>
                <span className="dimmed micro-space">{property}: </span>
                <span title={changes[property]}>{shortenString(changes[property])}</span>
            </div>
        case 'admin':
            return <div>
                <span className="dimmed micro-space">{property}: </span>
                <AccountAddress account={changes[property]}/>
            </div>
        default:
            return <div>
                <span className="dimmed micro-space">{property}: </span>
                <span className="text-small word-break">
                    {changes[property]}
                </span>
            </div>
    }
}