import React, {useCallback, useRef, useState} from 'react'
import {observer} from 'mobx-react'
import {StrKey} from '@stellar/stellar-sdk'
import AddAssetEntryLayout from './add-asset-entry-layout'

export default observer(function AddClassicAssetEntry({contract, save}) {
    const [asset, setAsset] = useState({})
    const [isValid, setIsValid] = useState(false)
    const [isEntered, setIsEntered] = useState(false)
    const currentInput = useRef(null)

    const validate = useCallback(newAsset => {
        const pattern = new RegExp("[^a-zA-z]")
        if (!(newAsset.code?.length > 0 && newAsset.code?.length <= 12) || pattern.test(newAsset.code) ||
            contract.assets.some(asset => asset.code === `${newAsset.code}:${newAsset.issuer}`)) {
            return false
        }
        if ((newAsset.code !== 'XLM') && !StrKey.isValidEd25519PublicKey(newAsset.issuer))
            return false
        return true
    }, [contract])

    const onChangeCode = useCallback(e => {
        const val = e.target.value.trim()
        const newAsset = {...asset, code: val}
        setAsset(newAsset)
        setIsValid(validate(newAsset))
    }, [asset, validate])

    const onChangeIssuer = useCallback(e => {
        const val = e.target.value.trim()
        const newAsset = {...asset, issuer: val}
        setAsset(newAsset)
        setIsValid(validate(newAsset))
    }, [asset, validate])
    //save on "Enter"
    const onKeyDown = useCallback(e => setIsEntered(e.keyCode === 13 && isValid), [isValid])

    return <AddAssetEntryLayout title="Add Stellar asset" ref={currentInput} asset={`${asset.code}:${asset.issuer || ''}`}
                                isEntered={isEntered} isValid={isValid} save={save}>
        <label>
            <span className="dimmed">Asset code</span>
            <input ref={currentInput} value={asset.code || ''} onChange={onChangeCode} onKeyDown={onKeyDown} placeholder="e.g. USD"/>
        </label>
        <label>
            <span className="dimmed">Issuer address</span>
            <input value={asset.issuer || ''} onChange={onChangeIssuer} onKeyDown={onKeyDown} placeholder="GC3N..."/>
        </label>
    </AddAssetEntryLayout>
})