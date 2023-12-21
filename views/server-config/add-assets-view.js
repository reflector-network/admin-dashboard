import React, {useCallback, useEffect, useState} from 'react'
import {AssetLink} from '@stellar-expert/ui-framework'
import {shortenString} from '@stellar-expert/formatter'
import {navigation} from '@stellar-expert/navigation'
import ActionFormLayout, {updateTimeValidation} from './action-form-layout'
import AddGenericAssetEntry from './add-generic-asset-entry-form'
import AddClassicAssetEntry from './add-classic-asset-entry-form'
import AddSorobanTokenEntry from './add-soroban-token-entry-form'
import ActionNodeLayout from './action-node-layout'

export default function AddAssetsView({settings, contractId}) {
    const supportedAssets = settings.config.contracts[contractId].assets
    const [editableAssets, setEditableAssets] = useState([])
    const [isValid, setIsValid] = useState(false)
    const [changedSettings, setChangedSettings] = useState(structuredClone(settings))
    const contract = changedSettings.config.contracts[contractId]

    //redirect to main page if contractId from URL params is invalid
    if (!contract) {
        navigation.navigate('/')
    }

    //reset form if contract has been changed
    useEffect(() => {
        setEditableAssets([])
        setChangedSettings(structuredClone(settings))
    }, [settings, contractId])

    const validation = useCallback(newSettings => {
        if (newSettings.length === supportedAssets.length)
            return setIsValid(false)
        if (!updateTimeValidation(newSettings))
            return setIsValid(false)
        setIsValid(true)
    }, [supportedAssets])

    const updateAssets = useCallback(assetList => {
        setEditableAssets(assetList)
        setChangedSettings(prev => {
            const newSettings = {...prev}
            newSettings.config.contracts[contractId].assets =
                [...supportedAssets, ...assetList]
            validation(newSettings)
            return newSettings
        })
    }, [supportedAssets, contractId, validation])

    const addAsset = useCallback(val => {
        const [code, pubkey] = val.split(':')
        const asset = pubkey ?
            {type: 1, code: code + ':' + pubkey} :
            {
                type: (code.length === 56 || code === 'XLM') ? 1 : 2,
                code
            }
        if (contract.assets.findIndex(a => a.code === asset.code) !== -1)
            return false
        updateAssets([...editableAssets, asset])
    }, [contract, editableAssets, updateAssets])

    return <ActionNodeLayout settings={changedSettings} currentConfig={settings} isValid={isValid}>
        <h3>Tracked assets</h3>
        <hr className="flare"/>
        <ActionFormLayout contract={contract} updateSettings={setChangedSettings} validation={validation}>
            <span>Supported assets</span>
            <br/>
            <span className="dimmed text-tiny">
                (List of assets with prices tracked by the quorum nodes)
            </span>
            {supportedAssets?.map(asset =>
                <AssetEntryLayout key={asset.code} asset={asset}/>)}
            {!!editableAssets.length && <h4 className="space">New assets</h4>}
            {editableAssets?.map(asset =>
                <AssetEntryLayout key={asset.code} asset={asset} editableAssets={editableAssets} updateAssets={updateAssets}/>)}
            <div className="space">
                <AddClassicAssetEntry contract={contract} save={addAsset}/>
                &nbsp;or&nbsp;
                <AddSorobanTokenEntry contract={contract} save={addAsset}/>
                &nbsp;or&nbsp;
                <AddGenericAssetEntry contract={contract} save={addAsset}/>
            </div>
        </ActionFormLayout>
    </ActionNodeLayout>
}

function AssetEntryLayout({asset, editableAssets = [], updateAssets}) {
    const removeAsset = useCallback(() => {
        const confirmation = `Do you really want to remove this asset?`
        if (confirm(confirmation)) {
            updateAssets(editableAssets.filter(a => a.code !== asset.code))
        }
    }, [asset, editableAssets, updateAssets])

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