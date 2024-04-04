import React, {useCallback, useEffect, useRef, useState} from 'react'
import {Button} from '@stellar-expert/ui-framework'
import DialogView from './dialog-view'

function validateNotification(notification) {
    const pattern = new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/)
    if (!notification.email?.length || !pattern.test(notification.email))
        return
    return true
}

export default function AddNotificationEntry({title, editNotification, isEditFormOpen, save}) {
    const [isOpen, setIsOpen] = useState(isEditFormOpen)
    const [isValid, setIsValid] = useState(false)
    const [notification, setNotification] = useState(editNotification || {})
    const emailInput = useRef(null)

    useEffect(() => setIsOpen(isEditFormOpen), [isEditFormOpen])

    useEffect(() => {
        setTimeout(() => {
            const input = emailInput.current
            if (isOpen && input) {
                input.focus()
            }
        }, 200)
    }, [isOpen])

    const toggleShowForm = useCallback(() => setIsOpen(prev => !prev), [])

    const onChangeEmail = useCallback(e => {
        setNotification(prev => {
            const newNotification = {...prev, email: e.target.value.trim()}
            setIsValid(validateNotification(newNotification))
            return newNotification
        })
    }, [])

    const onSave = useCallback(() => {
        save(notification)
        setNotification({})
        toggleShowForm()
    }, [notification, save, toggleShowForm])
    //save on "Enter"
    const onKeyDown = useCallback(function (e) {
        if (e.keyCode === 13 && isValid) {
            onSave(notification)
        }
    }, [isValid, notification, onSave])

    return <div>
        {!!title && <div className="space"><a onClick={toggleShowForm}>{title}</a></div>}
        <DialogView dialogOpen={isOpen} smaller>
            <h3>{editNotification ? 'Edit email' : 'Add new email'}</h3>
            <div className="space">
                <input ref={emailInput} value={notification.email || ''} placeholder="Email for notification"
                       onChange={onChangeEmail} onKeyDown={onKeyDown}/>
                <div className="row micro-space">
                    <div className="column column-33 column-offset-33">
                        <Button block disabled={!isValid} onClick={onSave}>Confirm</Button>
                    </div>
                    <div className="column column-33">
                        <Button block outline onClick={toggleShowForm}>Cancel</Button>
                    </div>
                </div>
            </div>
        </DialogView>
    </div>
}