import React, {useCallback, useRef, useState} from 'react'
import {Button} from '@stellar-expert/ui-framework'
import {observer} from 'mobx-react'
import {StrKey} from 'stellar-sdk'

export default observer(function AddClassicAssetEntry({title, settings, save}) {
    const [isVisible, setIsVisible] = useState(false)
    const [isValid, setIsValid] = useState(false)
    const [asset, setAsset] = useState({})
    const currentInput = useRef(null)

    const toggleShowForm = useCallback(() => {
        setIsVisible(!isVisible)
        setTimeout(() => {
            const input = currentInput.current
            if (input) {
                input.focus()
            }
        }, 200)
    }, [isVisible])

    const validate = useCallback(newAsset => {
        const pattern = new RegExp("[^a-zA-z]")
        if (!(newAsset.code?.length > 0 && newAsset.code?.length <= 12) || pattern.test(newAsset.code) ||
            settings.data.assets.findIndex(asset => asset.code === `${newAsset.code}:${newAsset.issuer}`) !== -1) {
            return false
        }
        if (!StrKey.isValidEd25519PublicKey(newAsset.issuer))
            return false
        return true
    }, [settings])

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

    const onSave = useCallback(() => {
        save(`${asset.code}:${asset.issuer}`)
        toggleShowForm()
    }, [asset, save, toggleShowForm])
    //save on "Enter"
    const onKeyDown = useCallback(function (e) {
        if (e.keyCode === 13 && isValid) {
            onSave()
        }
    }, [isValid, onSave])

    return <>
        <a onClick={toggleShowForm}>{title}</a>
        {!!isVisible && <div className="micro-space">
            <input ref={currentInput} value={asset.code || ''} onChange={onChangeCode} onKeyDown={onKeyDown} placeholder="Put code of asset"/>
            <input value={asset.issuer || ''} onChange={onChangeIssuer} onKeyDown={onKeyDown} placeholder="Put public key"/>
            <div className="row micro-space">
                <div className="column column-50">
                    <Button block disabled={!isValid} onClick={onSave}>Save</Button>
                </div>
                <div className="column column-50">
                    <Button block outline onClick={toggleShowForm}>Cancel</Button>
                </div>
            </div>
        </div>}
    </>
})