import React, {forwardRef, useCallback, useEffect, useState} from 'react'
import {Button} from '@stellar-expert/ui-framework'

export default forwardRef(function AddAssetEntryLayout({title, currentInput, asset, isValid, isEntered, save, children}) {
    const [isVisible, setIsVisible] = useState(false)

    const toggleShowForm = useCallback(() => {
        setIsVisible(prev => !prev)
        setTimeout(() => {
            const input = currentInput.current
            if (input) {
                input.focus()
            }
        }, 200)
    }, [currentInput])

    const onSave = useCallback(() => {
        save(asset)
        toggleShowForm()
    }, [asset, save, toggleShowForm])

    useEffect(() => {
        if (isEntered)
            onSave()
    }, [isEntered, onSave])

    return <>
        <a onClick={toggleShowForm}>{title}</a>
        {!!isVisible && <div className="micro-space">
            {children}
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