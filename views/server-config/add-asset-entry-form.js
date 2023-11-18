import React, {useCallback, useRef, useState} from 'react'
import {Button} from '@stellar-expert/ui-framework'
import {observer} from 'mobx-react'

export default observer(function AddAssetEntry({title, settings, save}) {
    const [isVisible, setIsVisible] = useState(false)
    const [isValid, setIsValid] = useState(false)
    const currentInput = useRef(null)

    const toggleShowForm = useCallback(() => {
        setIsVisible(!isVisible)
        setTimeout(() => {
            const input = currentInput.current
            if (input) {
                input.value = ''
                input.focus()
            }
        }, 200)
    }, [isVisible])

    const validate = useCallback(val => {
        const pattern = new RegExp("[^a-zA-z]")
        if (pattern.test(val) || settings.data.assets.findIndex(asset => asset.code === val) !== -1) {
            return false
        }
        return true
    }, [settings])

    const onChangeCode = useCallback(e => {
        const val = e.target.value.trim()
        setIsValid(validate(val))
    }, [validate])

    const onSave = useCallback(() => {
        const val = currentInput.current.value.trim()
        save(val)
        toggleShowForm()
    }, [save, toggleShowForm])
    //save on "Enter"
    const onKeyDown = useCallback(function (e) {
        if (e.keyCode === 13 && isValid) {
            onSave()
        }
    }, [isValid, onSave])

    return <>
        <a onClick={toggleShowForm}>{title}</a>
        {!!isVisible && <div className="micro-space">
            <input ref={currentInput} onChange={onChangeCode} onKeyDown={onKeyDown} placeholder="Asset symbol"/>
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