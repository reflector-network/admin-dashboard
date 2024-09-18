import React, {useCallback, useEffect, useState} from 'react'
import {navigation} from '@stellar-expert/navigation'
import AssetCodeView from '../../components/asset-code-view'
import detectConfigChanges from '../../util/config-changes-detector'
import AddGenericAssetEntry from './add-generic-asset-entry-form'
import AddClassicAssetEntry from './add-classic-asset-entry-form'
import AddSorobanTokenEntry from './add-soroban-token-entry-form'
import ActionNodeLayout from '../action-node-layout'

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

    //reset form after update
    useEffect(() => {
        setEditableAssets([])
        setChangedSettings(structuredClone(settings))
    }, [settings])

    const validation = useCallback(newSettings => {
        if (newSettings.length === supportedAssets.length)
            return setIsValid(false)
        if (!detectConfigChanges(changedSettings.config, settings.config).length)
            return setIsValid(false)
        setIsValid(true)
    }, [supportedAssets, changedSettings, settings])

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
        if (contract.assets.some(a => a.code === asset.code))
            return false
        updateAssets([...editableAssets, asset])
    }, [contract, editableAssets, updateAssets])

    return <ActionNodeLayout title="Tracked assets" settings={changedSettings} timeframe={contract?.timeframe} isValid={isValid}
                             description={<AddAssetsDescription/>}>
        {supportedAssets?.map(asset =>
            <AssetEntryLayout key={asset.code} asset={asset}/>)}
        {!!editableAssets.length && <h4 className="space">New assets</h4>}
        {editableAssets?.map(asset =>
            <AssetEntryLayout key={asset.code} asset={asset} editableAssets={editableAssets} updateAssets={updateAssets}/>)}
        <div className="space">
            <AddClassicAssetEntry contract={contract} save={addAsset}/>
            &nbsp;or&nbsp;
            <AddGenericAssetEntry contract={contract} save={addAsset}/>
        </div>
    </ActionNodeLayout>
}

function AddAssetsDescription() {
    return <>
        <p>
            List of assets/symbols tracked by the cluster nodes for this oracle.
        </p>
        <p>
            For on-chain Stellar assets price feed data retrieval Reflector relies on a quorum of nodes connected to Stellar validators.
            Each node fetches trades information directly from the Stellar Core database.
        </p>
        <p>
            Price feeds for external symbols are updated in a similar fashion, but nodes have to agree on information pulled from external
            sources (CEX/DEX API, price aggregators, stock exchanges, derivative platforms, etc.)
        </p>
    </>
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
        {editableAssets.some(a => a.code === asset.code) &&
            <a onClick={removeAsset} style={{marginLeft: '0.3em'}}><i className="icon-cancel"/></a>}
    </div>
}