import React, {useCallback, useEffect, useState} from 'react'
import {observer} from 'mobx-react'
import {runInAction} from 'mobx'
import {AssetLink} from '@stellar-expert/ui-framework'
import parseExternalUpdateRequest from '../util/external-update-request-parser'
import ActionFormLayout from './action-form-layout'
import AddAssetEntry from './add-asset-entry-form'
import AddClassicAssetEntry from './add-classic-asset-entry-form'
import ActionNodeLayout from './action-node-layout'

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

export default observer(function AddAssetsView({settings}) {
    const [editableAssets, setEditableAssets] = useState([])
    const [uniqueAssets, setUniqueAssets] = useState(removeDuplicateAssets(settings.data.assets))

    useEffect(() => {
        const updateParams = parseExternalUpdateRequest()
        if (updateParams?.assets) {
            const updatedAssets = updateParams.assets || []
            setEditableAssets(updatedAssets)
            runInAction(() => {
                settings.data.assets = settings.loadedData.assets || []
                settings.updatedAssets = updatedAssets
            })
        } else {
            runInAction(() => settings.data.assets = settings.loadedData.assets || [])
            setEditableAssets([])
        }
    }, [settings, settings.data, settings.loadedData, settings.isFinalized])

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
        const asset = pubkey ? {type: 1, code: code + ':' + pubkey} : {type: 2, code: code.toUpperCase()}
        if (settings.data.assets.findIndex(a => a.code === asset.code) !== -1)
            return false
        const assets = [...editableAssets, asset]
        setEditableAssets(assets)
        runInAction(() => {
            settings.data.assets = [...settings.data.assets, asset]
            settings.updatedAssets = [...assets]
        })
        settings.validate()
    }, [settings, editableAssets])

    return <ActionNodeLayout settings={settings}>
        <h3>Tracked assets</h3>
        <hr className="flare"/>
        <ActionFormLayout settings={settings}>
            <div className="row">
                <div className="column column-50">
                    <b>Supported assets</b>
                    {uniqueAssets?.map(asset =>
                        <AssetEntryLayout key={asset.code} asset={asset}/>)}
                    {!!editableAssets.length && <div className="space"><b>New assets</b></div>}
                    {editableAssets?.map(asset =>
                        <AssetEntryLayout key={asset.code} asset={asset} settings={settings}
                                          editableAssets={editableAssets} setEditableAssets={setEditableAssets}/>)}
                    <div className="space">
                        <AddClassicAssetEntry title="Add SAC asset" settings={settings} save={addAsset}/>
                        &nbsp;or&nbsp;
                        <AddAssetEntry title="Add generic asset" settings={settings} save={addAsset}/>
                    </div>
                </div>
            </div>
        </ActionFormLayout>
    </ActionNodeLayout>
})

const AssetEntryLayout = observer(({asset, settings, editableAssets = [], setEditableAssets}) => {
    const removeAsset = useCallback(() => {
        const confirmation = `Do you really want to remove this asset?`
        if (confirm(confirmation)) {
            setEditableAssets(editableAssets.filter(a => a.code !== asset.code))
            runInAction(() => {
                settings.data.assets = settings.data.assets.filter(a => a.code !== asset.code)
                settings.updatedAssets = settings.updatedAssets.filter(a => a.code !== asset.code)
            })
            settings.validate()
        }
    }, [settings, asset, editableAssets, setEditableAssets])

    return <div key={asset.code} className="micro-space">
        {(parseInt(asset.type, 10) === 1) ?
            <AssetLink asset={asset.code}/> :
            <b>{asset.code}</b>}
        {editableAssets.findIndex(a => a.code === asset.code) !== -1 &&
            <a onClick={removeAsset} style={{marginLeft: '0.3em'}}><i className='icon-cancel'/></a>}
    </div>
})