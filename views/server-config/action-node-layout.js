import React, {useCallback, useState} from 'react'
import {observer} from 'mobx-react'
import {runInAction} from 'mobx'
import {parseQuery} from '@stellar-expert/navigation'
import {Button, CopyToClipboard} from '@stellar-expert/ui-framework'
import {postApi} from '../../api/interface'
import UpdateRequestConfirmationLayout from '../layout/update-request-confirmation-layout'

export default observer(function ActionNodeLayout({settings, children}) {
    const [inProgress, setInProgress] = useState(false)

    const submitUpdates = useCallback(() => {
        setInProgress(true)
        if (!settings.updateData)
            settings.prepareData()

        postApi('update', settings.updateData)
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                const {nonce, ...data} = settings.updateData
                runInAction(() => {
                    settings.isFinalized = true
                    settings.updateSubmitted = data
                    settings.updateData = null
                    settings.isValid = false
                })
                notify({type: 'success', message: 'Update completed'})
                settings.fetchSettings() //reload updated data
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to update data'}))
            .finally(() => setInProgress(false))
    }, [settings])

    return <div className="flex-column h-100">
        <UpdateRequestConfirmationLayout/>
        <div className="segment blank h-100">
            <div>
                {children}
            </div>
            <div className="space row">
                <div className="column column-66 text-center">
                    {!!inProgress && <>
                        <div className="loader inline"/>
                        <span className="dimmed text-small"> In progress...</span>
                    </>}
                </div>
                <div className="column column-33">
                    <Button block disabled={!settings.isValid || inProgress} onClick={submitUpdates}>Submit</Button>
                </div>
            </div>
            {!!settings.isFinalized && <UpdateDataLinkLayout settings={settings}/>}
        </div>
    </div>
})

function UpdateDataLinkLayout({settings}) {
    const encodedData = encodeURIComponent(JSON.stringify(settings.updateSubmitted))
    const {section} = parseQuery()
    const link = window.location.href.split('?')[0] + '?section=' + section + '&update=' + encodedData

    return <div className="space">
        <hr className="flare"/>
        Share this quorum update with other nodes.
        Copy the link and send it to other node operators <CopyToClipboard text={link}/>
        <textarea readOnly style={{width: '100%', height: '5em'}} value={link}/>
    </div>
}