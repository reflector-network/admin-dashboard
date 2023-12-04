import React, {useCallback, useEffect, useState} from 'react'
import {AssetLink} from '@stellar-expert/ui-framework'
import {shortenString} from '@stellar-expert/formatter'
import ActionFormLayout from './action-form-layout'
import AddGenericAssetEntry from './add-generic-asset-entry-form'
import AddClassicAssetEntry from './add-classic-asset-entry-form'
import ActionNodeLayout from './action-node-layout'
import AddSorobanTokenEntry from './add-soroban-token-entry-form'

const removeDuplicateAssets = (assets = []) => {
    const comparedAssets = []
    return assets.filter(asset => {
        if (comparedAssets.indexOf(asset.code) === -1) {
            comparedAssets.push(asset.code)
            return true
        }
        return false
    })
}

export default function AddAssetsView({settings}) {
    const [editableAssets, setEditableAssets] = useState([])
    const [uniqueAssets, setUniqueAssets] = useState(removeDuplicateAssets(settings.data.assets))

    useEffect(() => {
        const uniqueAssetsList = removeDuplicateAssets(settings.data.assets)
        const editableAssetsList = editableAssets.reduce((list, asset) => {
            list.push(asset.code)
            return list
        }, [])
        const supportedAssets = uniqueAssetsList.filter(asset => !editableAssetsList.includes(asset.code))
        setUniqueAssets(supportedAssets)
    }, [settings.data.assets, editableAssets])

    const addAsset = useCallback(val => {
        const [code, pubkey] = val.split(':')
        const asset = pubkey ?
            {type: 1, code: code + ':' + pubkey} :
            {
                type: (code.length === 56 || code === 'XLM') ? 1 : 2,
                code
            }
        if (settings.data.assets.findIndex(a => a.code === asset.code) !== -1)
            return false
        const assets = [...editableAssets, asset]
        setEditableAssets(assets)
        settings.validate()
    }, [settings, editableAssets])

    return <ActionNodeLayout settings={settings} isValid>
        <h3>Tracked assets</h3>
        <hr className="flare"/>
        <ActionFormLayout settings={settings}>
            <span>Supported assets</span>
            <br/>
            <span className="dimmed text-tiny">
                (List of assets with prices tracked by the quorum nodes)
            </span>
            {uniqueAssets?.map(asset =>
                <AssetEntryLayout key={asset.code} asset={asset}/>)}
            {!!editableAssets.length && <h4 className="space">New assets</h4>}
            {editableAssets?.map(asset =>
                <AssetEntryLayout key={asset.code} asset={asset} settings={settings}
                                  editableAssets={editableAssets} setEditableAssets={setEditableAssets}/>)}
            <div className="space">
                <AddClassicAssetEntry title="Add SAC asset" settings={settings} save={addAsset}/>
                &nbsp;or&nbsp;
                <AddSorobanTokenEntry title="Add soroban token" settings={settings} save={addAsset}/>
                &nbsp;or&nbsp;
                <AddGenericAssetEntry title="Add generic asset" settings={settings} save={addAsset}/>
            </div>
        </ActionFormLayout>
    </ActionNodeLayout>
}

function AssetEntryLayout({asset, settings, editableAssets = [], setEditableAssets}) {
    const removeAsset = useCallback(() => {
        const confirmation = `Do you really want to remove this asset?`
        if (confirm(confirmation)) {
            setEditableAssets(editableAssets.filter(a => a.code !== asset.code))
            settings.validate()
        }
    }, [settings, asset, editableAssets, setEditableAssets])

    return <div key={asset.code} className="micro-space">
        <AssetCodeView asset={asset}/>
        {editableAssets.findIndex(a => a.code === asset.code) !== -1 &&
            <a onClick={removeAsset} style={{marginLeft: '0.3em'}}><i className="icon-cancel"/></a>}
    </div>
}

export function AssetCodeView({asset}) {
    if (!asset)
        return <></>
    const type = parseInt(asset.type, 10)
    if (type === 1 && asset.code.length === 56) {
        return <b title={asset.code}>{shortenString(asset.code, 8)}</b>
    }
    if (type === 1) {
        return <AssetLink asset={asset.code.toUpperCase()}/>
    }
    return <b>{asset.code}</b>
}