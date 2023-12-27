import React, {useCallback} from 'react'
import {navigation} from '@stellar-expert/navigation'
import {Button} from '@stellar-expert/ui-framework'
import {postApi} from '../../api/interface'
import clientStatus from '../../state/client-status'

export default function UpdateRequestVotingView({configuration}) {
    const votingSettings = configuration.pendingConfig?.config || configuration.currentConfig?.config
    const ownSign = votingSettings?.signatures.filter(sign => sign.pubkey === clientStatus.clientPublicKey).length

    const vote = useCallback(async (vote) => {
        const signature = await clientStatus.createSignature(votingSettings.config, !vote)

        const {id, initiator, status, ...otherSettings} = votingSettings
        postApi('config', {
            ...otherSettings,
            signatures: [signature]
        })
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                //reload configuration after update
                navigation.updateQuery({reload: 1})
                notify({type: 'success', message: 'Your vote has been accepted'})
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to vote'}))
    }, [votingSettings])

    const confirm = useCallback(() => vote(true), [vote])

    const reject = useCallback(() => vote(false), [vote])

    //hide confirmation if the update request doesn't exist or is signed
    if (!votingSettings || (votingSettings && !!ownSign))
        return <></>

    return <>
        <div className="segment warning">
            <div className="request-notification row row-center">
                <div className="column column-50">
                    <h3>Node configuration update request</h3>
                </div>
                <div className="column column-50">
                    <Button className="button-clear" onClick={confirm}>Improve</Button>
                    <Button className="button-clear" onClick={reject}>Reject</Button>
                </div>
            </div>
        </div>
        <div className="space"/>
    </>
}