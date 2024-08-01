import React from 'react'
import {AccountAddress} from '@stellar-expert/ui-framework'
import {shortenString} from '@stellar-expert/formatter'
import AssetCodeView from './asset-code-view'

export default function ChangesRecordView({data}) {
    switch (data.type) {
        case 'contract':
            return <div className="micro-space">
                <i className="icon-puzzle"/> Contract <span title={data.uid}>{shortenString(data.uid)}</span> {data.action}:
                <div className="block-indent">
                    {data.action === 'updated' ?
                        data.changes.map(property => {
                            const changes = {[property.type]: property.changes}
                            return <div key={data.uid + property.type + property.action}>
                                <ContractRecordView property={property.type} action={property.action} changes={changes}/>
                            </div>
                        }) :
                        Object.keys(data.changes).map(property => <div key={data.uid + property}>
                            <ContractRecordView property={property} changes={data.changes}/>
                        </div>)}
                </div>
            </div>
        case 'nodes':
            return <div className="micro-space">
                <i className="icon-puzzle"/> Cluster node {data.action}:
                <div className="block-indent">
                    {data.changes.map(node => <div key={node.pubkey}>
                        <div className="word-break">
                            <i className="icon-hexagon-dice color-success"/>
                            <AccountAddress account={node.pubkey} char={16}/>
                        </div>
                        {!!node.url && <div className="dimmed text-small">&emsp;&emsp;{node.url}</div>}
                        {!!node.domain && <div className="dimmed text-small">&emsp;&emsp;{node.domain}</div>}
                    </div>)}
                </div>
            </div>
        default:
            return <div>
                <i className="icon-puzzle"/> Parameter "{data.type}" {data.action}:
                <span className="word-break"> {data.changes}</span>
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