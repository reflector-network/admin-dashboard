import React, {useCallback, useRef, useState} from 'react'
import {observer} from 'mobx-react'
import AddAssetEntryLayout from './add-asset-entry-layout'

export default observer(function AddGenericAssetEntry({contract, save}) {
    const [asset, setAsset] = useState('')
    const [isValid, setIsValid] = useState(false)
    const [isEntered, setIsEntered] = useState(false)
    const currentInput = useRef(null)

    const validate = useCallback(val => {
        const pattern = new RegExp("[^a-zA-z]")
        if (pattern.test(val) || contract.assets.some(asset => asset.code === val)) {
            return false
        }
        return true
    }, [contract])

    const onChangeCode = useCallback(e => {
        const val = e.target.value.trim()
        setAsset(val)
        setIsValid(validate(val))
    }, [validate])
    //save on "Enter"
    const onKeyDown = useCallback(e => setIsEntered(e.keyCode === 13 && isValid), [isValid])

    return <AddAssetEntryLayout title="Add external symbol" ref={currentInput} asset={asset}
                                isEntered={isEntered} isValid={isValid} save={save}>
        <label>
            <span className="dimmed">Asset symbol</span>
            <input ref={currentInput} onChange={onChangeCode} onKeyDown={onKeyDown} placeholder="e.g. USD"/>
        </label>
    </AddAssetEntryLayout>
})