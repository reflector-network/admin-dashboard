import React, {useCallback, useEffect, useState} from 'react'
import {Button} from '@stellar-expert/ui-framework'
import {getNotificationSettings, postApi} from '../../api/interface'
import AddNotificationEntry from './add-notification-entry-form'

export default function NotificationSettingsView() {
    const [notifications, setNotifications] = useState()
    const [hasChanges, setHasChanges] = useState(false)
    const [inProgress, setInProgress] = useState(false)

    useEffect(() => {
        getNotificationSettings()
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                const emails = (res.emails?.length) ? res.emails.reduce((a, c) => {
                    a.push({email: c})
                    return a
                }, []) : []
                setNotifications({emails})
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to get notification data'}))
    }, [])

    const updateNotifications = useCallback(notification => {
        setNotifications(prev => {
            const emails = [...prev.emails, notification]
            return {...prev, emails}
        })
        setHasChanges(true)
    }, [])

    const saveNotifications = useCallback(() => {
        setInProgress(true)
        const emails = notifications.emails.map(e => e.email.trim())
        postApi('settings/node', {emails})
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                setHasChanges(false)
                notify({type: 'success', message: 'Changes saved'})
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to update data'}))
            .finally(() => setInProgress(false))
    }, [notifications])

    return <div className="segment blank h-100">
        <div>
            <h3>Notification settings</h3>
            <hr className="flare"/>
            <div className="space">
                <h4>Email notifications</h4>
                {notifications?.emails.length ?
                    notifications.emails.map(entry =>
                        <NotificationEntryView key={entry.email} notification={entry}
                                               update={setNotifications} setHasChanges={setHasChanges}/>) :
                    <p className="micro-space">There are no notification emails</p>}
            </div>
            <AddNotificationEntry title={<><i className="icon-plus"/>Add new email</>} save={updateNotifications}/>
            <div className="space row">
                <div className="column column-66">
                    {(!!hasChanges && !inProgress) && <div className="dimmed text-small micro-space"> You have unsaved pending changes</div>}
                    {!!inProgress && <>
                        <div className="loader inline"/>
                        <span className="dimmed text-small"> In progress...</span>
                    </>}
                </div>
                <div className="column column-33">
                    <Button block disabled={inProgress || !hasChanges} onClick={saveNotifications}>Submit</Button>
                </div>
            </div>
        </div>
    </div>
}

function NotificationEntryView({notification, update, setHasChanges}) {
    const idNotification = notification.email
    const [isEditFormOpen, setIsEditFormOpen] = useState(false)

    const toggleShowForm = useCallback(() => setIsEditFormOpen(isOpen => !isOpen), [])

    const removeNotification = useCallback(() => {
        const confirmation = `Do you really want to remove this email?`
        if (confirm(confirmation)) {
            update(prev => {
                const emails = [...prev.emails]
                const index = prev.emails.findIndex(n => n.email === notification.email)
                emails.splice(index, 1)
                return {...prev, emails}
            })
            setHasChanges(true)
        }
    }, [notification, update, setHasChanges])

    const onSave = useCallback(notification => {
        update(prev => {
            const emails = prev.emails.map(e => e.email === idNotification ? notification : e)
            return {...prev, emails}
        })
        setIsEditFormOpen(false)
        setHasChanges(true)
    }, [idNotification, update, setHasChanges])

    return <div className="micro-space">
        <strong>{notification.email}</strong>&nbsp;
        <span>
            <a href="#" className="icon-cog" onClick={toggleShowForm}/>
            <a href="#" className="icon-cancel" onClick={removeNotification}/>
        </span>
        <AddNotificationEntry editNotification={notification} isEditFormOpen={isEditFormOpen} save={onSave}/>
    </div>
}