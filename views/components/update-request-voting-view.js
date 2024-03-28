import React, {useCallback, useEffect, useState} from 'react'
import {navigation} from '@stellar-expert/navigation'
import {Button, CodeBlock, UtcTimestamp} from '@stellar-expert/ui-framework'
import {getCurrentConfig, postApi} from '../../api/interface'
import clientStatus from '../../state/client-status'
import invocationFormatter from '../util/invocation-formatter'
import DialogView from './dialog-view'

const configRefreshInterval = 30//30 seconds

export default function UpdateRequestVotingView({configuration}) {
    const [actualConfig, setActualConfig] = useState(configuration)
    const [isOpen, setIsOpen] = useState(false)
    const votingSettings = actualConfig.pendingConfig?.config || actualConfig.currentConfig?.config
    const ownSign = votingSettings?.signatures.filter(sign => sign.pubkey === clientStatus.clientPublicKey).length
    const readonlyConfigProperties = invocationFormatter(votingSettings.config || {}, 1)

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

    const toggleShowConfig = useCallback(() => setIsOpen(prev => !prev), [])

    const showChanges = useCallback(() => {
        navigation.navigate('/?section=upgrade')
        setIsOpen(false)
    }, [])

    //hide confirmation if the update request doesn't exist or is signed
    if (!votingSettings || (votingSettings && !!ownSign))
        return <></>

    return <>
        <div className="segment warning">
            <div className="request-notification row row-center">
                <div className="column column-66">
                    <h3>Node configuration update request <a className="icon-open-new-window" onClick={toggleShowConfig}/></h3>
                    <div className="dimmed">
                        {votingSettings.description || 'Without description'}
                        <div className="text-tiny micro-space">
                            Expiration date:&nbsp;
                            <UtcTimestamp date={votingSettings.expirationDate}/>
                        </div>
                    </div>
                </div>
                <div className="column column-33">
                    <Button className="button-clear" onClick={confirm}>Approve</Button>
                    <Button className="button-clear" onClick={reject}>Reject</Button>
                </div>
            </div>
        </div>
        <div className="space"/>
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