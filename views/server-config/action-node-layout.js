import React, {useCallback, useState} from 'react'
import {Button} from '@stellar-expert/ui-framework'
import {postApi} from '../../api/interface'
import clientStatus from '../../state/client-status'

export default function ActionNodeLayout({settings, isValid, children}) {
    const [inProgress, setInProgress] = useState(false)
    console.log('settings',isValid, settings)

    const submitUpdates = useCallback(async () => {
        setInProgress(true)
        settings.config.contracts = Object.values(settings.config.contracts)
        const signature = await clientStatus.createSignature(settings.config)

        postApi('config', {
            ...settings,
            signatures: [signature]
        })
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                
                notify({type: 'success', message: 'Update submited'})
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to update data'}))
            .finally(() => setInProgress(false))
    }, [settings])

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
                <Button block disabled={!isValid || inProgress} onClick={submitUpdates}>Submit</Button>
            </div>
        </div>
    </div>
}