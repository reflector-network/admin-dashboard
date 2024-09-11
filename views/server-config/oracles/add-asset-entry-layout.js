import React, {forwardRef, useCallback, useEffect, useState} from 'react'
import {Button} from '@stellar-expert/ui-framework'
import DialogView from '../../components/dialog-view'

export default forwardRef(function AddAssetEntryLayout(props, ref) {
    const {title, asset, isValid, isEntered, save, children} = props
    const [isOpen, setIsOpen] = useState(false)

    const toggleShowForm = useCallback(() => {
        setIsOpen(prev => !prev)
        setTimeout(() => {
            const input = ref?.current
            if (input) {
                input.focus()
            }
        }, 200)
    }, [ref])

    const onSave = useCallback(() => {
        save(asset)
        toggleShowForm()
    }, [asset, save, toggleShowForm])

    useEffect(() => {
        if (isEntered)
            onSave()
    }, [isEntered, onSave])

    return <>
        <a href="#" className="icon-add-circle" onClick={toggleShowForm}>{title}</a>
        <DialogView dialogOpen={isOpen} smaller>
            <h3>{title}</h3>
            <hr className="flare"/>
            <div className="micro-space"/>
            {children}
            <div className="row micro-space">
                <div className="column column-33 column-offset-33">
                    <Button block disabled={!isValid} onClick={onSave}>Confirm</Button>
                </div>
                <div className="column column-33">
                    <Button block outline onClick={toggleShowForm}>Cancel</Button>
                </div>
            </div>
        </DialogView>
    </>
})