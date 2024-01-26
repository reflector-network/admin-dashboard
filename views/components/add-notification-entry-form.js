import React, {useCallback, useEffect, useRef, useState} from 'react'
import {Button} from '@stellar-expert/ui-framework'

function validateNotification(notification) {
    const pattern = new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/)
    if (!notification.email?.length || !pattern.test(notification.email))
        return
    return true
}

export default function AddNotificationEntry({title, editNotification, isEditFormOpen, save}) {
    const [isVisible, setIsVisible] = useState(isEditFormOpen)
    const [isValid, setIsValid] = useState(false)
    const [notification, setNotification] = useState(editNotification || {})
    const emailInput = useRef(null)

    useEffect(() => setIsVisible(isEditFormOpen), [isEditFormOpen])

    useEffect(() => {
        setTimeout(() => {
            const input = emailInput.current
            if (isVisible && input) {
                input.focus()
            }
        }, 200)
    }, [isVisible])

    const toggleShowForm = useCallback(() => setIsVisible(prev => !prev), [])

    const onChangeEmail = useCallback(e => {
        setNotification(prev => {
            const newNotification = {...prev, email: e.target.value.trim()}
            setIsValid(validateNotification(newNotification))
            return newNotification
        })
    }, [])

    const onSave = useCallback(() => {
        save(notification)
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
        {!!isVisible && <div className="row micro-space">
            <div className="column column-66">
                <input ref={emailInput} value={notification.email || ''} placeholder="Email for notification"
                       onChange={onChangeEmail} onKeyDown={onKeyDown}/>
                <div className="row micro-space">
                    <div className="column column-50">
                        <Button block disabled={!isValid} onClick={onSave}>Save</Button>
                    </div>
                    <div className="column column-50">
                        <Button block outline onClick={toggleShowForm}>Cancel</Button>
                    </div>
                </div>
            </div>
        </div>}
    </div>
}