import React, {useCallback, useEffect, useState} from 'react'
import {observer} from 'mobx-react'
import {runInAction} from 'mobx'
import {Button, CopyToClipboard} from '@stellar-expert/ui-framework'
import {postApi} from '../../api/interface'
import parseExternalUpdateRequest from '../util/external-update-request-parser'

export default observer(function ActionNodeLayout({settings, children}) {
    const [inProgress, setInProgress] = useState(false)

    useEffect(() => {
        const updateParams = parseExternalUpdateRequest()
        if (updateParams?.timestamp) {
            runInAction(() => settings.data.timestamp = updateParams?.timestamp)
        } else {
            runInAction(() => settings.data.timestamp = '')
        }
    }, [settings.data, settings.loadedData])

    const submitMessage = useCallback(message_signature => {

    }, [settings])

    const submitUpdates = useCallback(() => {
        setInProgress(true)
        if (!settings.updateData)
            settings.prepareData()

        postApi(settings.action, settings.updateData)
            .then(() => {
                const {nonce, ...data} = settings.updateData
                runInAction(() => {
                    settings.isFinalized = true
                    settings.updateDataLink = data
                    settings.updateData = null
                    settings.isValid = false
                })
                notify({type: 'success', message: 'Update completed'})
                settings.fetchSettings() //reload updated data
            })
            .catch(({error}) => notify({type: 'error', message: error?.message || 'Failed to update data'}))
            .finally(() => setInProgress(false))
    }, [settings, submitMessage])

    return <div className="segment blank">
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
})

function UpdateDataLinkLayout({settings}) {
    const encodedData = encodeURIComponent(JSON.stringify(settings.updateDataLink))
    const url = new URL(window.location)
    const sectionName = url.searchParams.get('section')
    const link = window.location.href.split('?')[0] + '?section=' + sectionName + '&update=' + encodedData

    return <div className="warning segment space">
        Implemented settings are available at the <a href={link}>link</a> (<CopyToClipboard text={link}/>)
    </div>
}