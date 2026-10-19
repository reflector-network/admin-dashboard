import React, {useCallback, useEffect, useState} from 'react'
import {navigation} from '@stellar-expert/ui-framework'
import {Button, CodeBlock, UtcTimestamp} from '@stellar-expert/ui-framework'
import {getCurrentConfig, postApi} from '../../api/interface'
import clientStatus from '../../state/client-status'
import invocationFormatter from '../util/invocation-formatter'
import DialogView from './dialog-view'
import {readVoteState} from './update-vote-state.mjs'

const configRefreshInterval = 30//30 seconds

const ownVoteText = {
    approved: 'You approved this update',
    rejected: 'You rejected this update'
}

export default function UpdateRequestVotingView({configuration}) {
    const [actualConfig, setActualConfig] = useState(configuration)
    const [isOpen, setIsOpen] = useState(false)
    const [confirming, setConfirming] = useState(null)
    const voteState = readVoteState(actualConfig, clientStatus.clientPublicKey)
    const votingSettings = voteState?.update
    const readonlyConfigProperties = invocationFormatter(votingSettings?.config || {}, 1)

    useEffect(() => {
        setActualConfig(configuration)
        const refreshConfig = setInterval(() => {
            getCurrentConfig()
                .then(res => {
                    if (res.error)
                        throw new Error(res.error)
                    setActualConfig(res)
                })
                .catch(error => console.error(error))
        }, configRefreshInterval * 1000)
        return () => clearInterval(refreshConfig)
    }, [configuration])

    //a vote on an update that is already scheduled carries its stored timestamp, which the envelope keeps
    const vote = useCallback(async (reject) => {
        const signature = await clientStatus.createSignature(votingSettings.config, reject)

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

    const runAction = useCallback(action => {
        if (action.confirm)
            return setConfirming(action)
        vote(action.reject)
    }, [vote])

    const confirmAction = useCallback(() => {
        const action = confirming
        setConfirming(null)
        vote(action.reject)
    }, [confirming, vote])

    const cancelAction = useCallback(() => setConfirming(null), [])

    const toggleShowConfig = useCallback(() => setIsOpen(prev => !prev), [])

    const showChanges = useCallback(() => {
        navigation.navigate('/?section=upgrade')
        setIsOpen(false)
    }, [])

    if (!voteState)
        return <></>

    return <>
        <div className="segment warning">
            <div className="request-notification row row-center">
                <div className="column column-66">
                    <h3>Node configuration update request <a className="icon-open-new-window" onClick={toggleShowConfig}/></h3>
                    <div className="dimmed">
                        {votingSettings.description || 'Without description'}
                        <div className="text-tiny micro-space">
                            {voteState.statusText}
                            {!!voteState.ownVote && <>. {ownVoteText[voteState.ownVote]}</>}
                        </div>
                        <div className="text-tiny micro-space">
                            Expiration date:&nbsp;
                            <UtcTimestamp date={votingSettings.expirationDate}/>
                        </div>
                    </div>
                </div>
                <div className="column column-33">
                    {voteState.actions.map(action =>
                        <Button key={action.label} className="button-clear" onClick={() => runAction(action)}>{action.label}</Button>)}
                </div>
            </div>
        </div>
        <div className="space"/>
        <DialogView dialogOpen={!!confirming} smaller>
            <h3>{confirming?.label} the update</h3>
            <hr className="flare"/>
            <div className="space">{confirming?.confirm}</div>
            <div className="row space">
                <div className="column column-50">
                    <Button block onClick={confirmAction}>{confirming?.label}</Button>
                </div>
                <div className="column column-50">
                    <Button block outline onClick={cancelAction}>Cancel</Button>
                </div>
            </div>
        </DialogView>
        <DialogView dialogOpen={isOpen}>
            <div>
                <h3>Quorum configuration file</h3>
                <hr className="flare"/>
                <div className="space">
                    <CodeBlock className="result" style={{height: '50vh'}} lang="js">{readonlyConfigProperties}</CodeBlock>
                </div>
            </div>
            <div className="row space">
                <div className="column column-25 column-offset-50">
                    {(!!actualConfig.currentConfig && !!actualConfig.pendingConfig) &&
                        <Button block onClick={showChanges}>View changes</Button>}
                </div>
                <div className="column column-25">
                    <Button block onClick={toggleShowConfig}>Close</Button>
                </div>
            </div>
        </DialogView>
    </>
}
