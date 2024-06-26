import React, {useCallback, useRef, useState} from 'react'
import {observer} from 'mobx-react'
import AddAssetEntryLayout from './add-asset-entry-layout'

export default observer(function AddSorobanTokenEntry({contract, save}) {
    const [asset, setAsset] = useState('')
    const [isValid, setIsValid] = useState(false)
    const [isEntered, setIsEntered] = useState(false)
    const currentInput = useRef(null)

    const validate = useCallback(val => {
        if (val.length !== 56 || !val.startsWith('C'))
            return false
        if (contract.assets.some(asset => asset.code === val))
            return false
        return true
    }, [contract])

    const onChangeCode = useCallback(e => {
        const val = e.target.value.trim()
        setAsset(val)
        setIsValid(validate(val))
    }, [validate])
    //save on "Enter"
    const onKeyDown = useCallback(e => setIsEntered(e.keyCode === 13 && isValid), [isValid])

    return <AddAssetEntryLayout title="Add soroban token" ref={currentInput} asset={asset}
                                isEntered={isEntered} isValid={isValid} save={save}>
        <label>
            <span className="dimmed">Soroban contract address</span>
            <input ref={currentInput} onChange={onChangeCode} onKeyDown={onKeyDown} placeholder="CDK7..."/>
        </label>
    </AddAssetEntryLayout>
})