import React, {useCallback, useState} from 'react'
import {Button} from '@stellar-expert/ui-framework'
import {postApi} from '../../api/interface'
import clientStatus from '../../state/client-status'
import configChangesDetector from '../util/config-changes-detecor'

export default function ActionNodeLayout({settings, currentConfig, isValid, children}) {
    const newSettings = structuredClone(settings)
    console.log(configChangesDetector(newSettings.config, currentConfig.config))
    //ready to submitting if there are valid changes
    const isReady = isValid && !!configChangesDetector(newSettings.config, currentConfig.config).length
    const [inProgress, setInProgress] = useState(false)

    const submitUpdates = useCallback(async () => {
        setInProgress(true)
        const signature = await clientStatus.createSignature(newSettings.config)

        const {id, initiator, status, ...otherProperties} = newSettings
        postApi('config', {
            ...otherProperties,
            signatures: [signature]
        })
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                notify({type: 'success', message: 'Update submited'})
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to update data'}))
            .finally(() => setInProgress(false))
    }, [newSettings])

    return <div className="segment blank h-100">
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
                <Button block disabled={!isReady || inProgress} onClick={submitUpdates}>Submit</Button>
            </div>
        </div>
    </div>
}