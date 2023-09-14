import React, {useCallback, useEffect, useState} from 'react'
import {observer} from 'mobx-react'
import {runInAction} from 'mobx'
import {CopyToClipboard} from '@stellar-expert/ui-framework'
import {shortenString} from '@stellar-expert/formatter'
import {StrKey} from 'stellar-sdk'
import parseExternalUpdateRequest from '../util/external-update-request-parser'
import ActionNodeLayout from './action-node-layout'
import ActionFormLayout from './action-form-layout'
import AddNodeEntry from './add-node-entry-form'

export default observer(function UpdateNodeView({settings}) {
    useEffect(() => {
        const updateParams = parseExternalUpdateRequest()
        if (updateParams?.nodes) {
            runInAction(() => {
                settings.isLimitUpdates = true
                settings.data.nodes = updateParams?.nodes || []
            })
        } else {
            runInAction(() => {
                if (settings.isFinalized) {
                    settings.isLimitUpdates = false
                }
                settings.data.nodes = settings.loadedData.nodes || []
            })
        }
        settings.validate()
    }, [settings, settings.data, settings.loadedData])

    const validation = useCallback(node => {
        if (!StrKey.isValidEd25519PublicKey(node.pubkey))
            return
        if (!node.url?.length)
            return
        return true
    }, [])

    const addNode = useCallback(node => {
        const index = settings.data.nodes.findIndex(n => n.pubkey === node.pubkey)
        if (index !== -1) {
            runInAction(() => {
                settings.data.nodes[index] = node
                settings.isLimitUpdates = true
            })
        } else {
            runInAction(() => {
                settings.data.nodes.push(node)
                settings.isLimitUpdates = true
            })
        }
        settings.validate()
    }, [settings])

    return <ActionNodeLayout settings={settings}>
        <h3>Update nodes</h3>
        <hr className="flare"/>
        <ActionFormLayout settings={settings}>
            <h3>Quorum nodes</h3>
            {settings.data.nodes?.map(node => {
                if (node.remove)
                    return false
                return <NodeEntryLayout key={node.pubkey} settings={settings} node={node} validation={validation} save={addNode}/>
            })}
            <div className="space"/>
            {!settings.isLimitUpdates && <AddNodeEntry title={<><i className="icon-plus"/>Add new node</>}
                                                       validation={validation} save={addNode}/>}
        </ActionFormLayout>
    </ActionNodeLayout>
})

const NodeEntryLayout = observer(({settings, node, validation, save}) => {
    const [isEditFormOpen, setIsEditFormOpen] = useState(false)

    const toggleShowForm = useCallback(() => setIsEditFormOpen(!isEditFormOpen), [isEditFormOpen])

    const removeNode = useCallback(() => {
        const confirmation = `Do you really want to remove this node?`
        if (confirm(confirmation)) {
            const index = settings.data.nodes.findIndex(n => n.pubkey === node.pubkey)
            runInAction(() => {
                settings.data.nodes[index].remove = true
                delete settings.data.nodes[index].url
                settings.isLimitUpdates = true
            })
            settings.validate()
        }
    }, [settings, node])

    const onSave = useCallback(e => {
        setIsEditFormOpen(false)
        save(e)
    }, [save])

    return <>
        <div className="dual-layout space">
            <div className="v-center-block">
                <span><i className="icon-hexagon-dice color-success"/>{shortenString(node.pubkey, 16)}</span>
                <span className="dimmed text-small">&emsp;&emsp;{node.url}</span>
            </div>
            <div style={{marginRight: 'auto'}}>
                <CopyToClipboard text={node.pubkey} title="Copy public key to clipboard"/>
                {!settings.isLimitUpdates && <a href="#" className="icon-cog" onClick={toggleShowForm}/>}
                {!settings.isLimitUpdates && <a href="#" className="icon-cancel" onClick={removeNode}/>}
            </div>
        </div>
        {!settings.isLimitUpdates && <AddNodeEntry validation={validation} editNode={node} isEditFormOpen={isEditFormOpen} save={onSave}/>}
    </>
})