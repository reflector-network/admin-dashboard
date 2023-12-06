import React, {useCallback, useState} from 'react'
import {Button} from '@stellar-expert/ui-framework'
import {postApi} from '../../api/interface'
import clientStatus from '../../state/client-status'

export default function UpdateRequestVotingView({pendingSettings}) {
    const ownSign = pendingSettings?.signatures.filter(sign => sign.pubkey === clientStatus.clientPublicKey).length
    const [isSigned, setIsSigned] = useState(!!ownSign)

    const vote = useCallback(async (vote) => {
        const signature = await clientStatus.createSignature(pendingSettings.config, !vote)

        postApi('config', {
            ...pendingSettings,
            signatures: [signature]
        })
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                setIsSigned(true)
                notify({type: 'success', message: 'Your vote has been accepted'})
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to vote'}))
    }, [pendingSettings])

    const confirm = useCallback(() => vote(true), [vote])

    const reject = useCallback(() => vote(false), [vote])

    //hide confirmation if the update request doesn't exist or is signed
    if (!pendingSettings || (pendingSettings && isSigned))
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