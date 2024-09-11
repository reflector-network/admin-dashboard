import React, {useCallback, useEffect, useState} from 'react'
import {AccountAddress, CopyToClipboard} from '@stellar-expert/ui-framework'
import detectConfigChanges from '../../util/config-changes-detector'
import ActionNodeLayout from '../action-node-layout'
import AddNodeEntry from './add-node-entry-form'
import './node-entry-layout.scss'

export default function UpdateNodeView({settings}) {
    const [isValid, setIsValid] = useState(false)
    const [changedSettings, setChangedSettings] = useState(structuredClone(settings))
    const [isLimitUpdates, setIsLimitUpdates] = useState(false)

    useEffect(() => {
        setChangedSettings(structuredClone(settings))
    }, [settings])

    const validation = useCallback(() => {
        if (!detectConfigChanges(changedSettings.config, settings.config).length)
            return setIsValid(false)
        setIsValid(true)
    }, [changedSettings, settings])

    const saveNode = useCallback((node) => {
        setChangedSettings(prev => {
            const newSettings = {...prev}
            if (node.remove) {
                delete newSettings.config.nodes[node.pubkey]
            } else {
                newSettings.config.nodes[node.pubkey] = node
            }
            validation(newSettings)
            return newSettings
        })
        setIsLimitUpdates(true)
    }, [validation])

    return <ActionNodeLayout title="Cluster nodes" settings={changedSettings} isValid={isValid} description={<UpdateNodeDescription/>}>
        {Object.values(changedSettings.config.nodes || {}).map(node => !node.remove &&
            <NodeEntryLayout key={node.pubkey} node={node} save={saveNode} isLimitUpdates={isLimitUpdates}/>)}
        <div className="space"/>
        {!isLimitUpdates && <AddNodeEntry title={<><i className="icon-add-circle"/>Add new node</>} save={saveNode}/>}
    </ActionNodeLayout>
}

function UpdateNodeDescription() {
    return <div>
        <p>
            Reflector nodes process, normalize, aggregate, and store trades information from Stellar DEX and external data sources.
            Nodes cluster is controlled by the multisig-protected consensus of reputable organizations.
        </p>
        <p>
            Each node independently calculates the values of quoted prices using deterministic idempotent algorithms to ensure consistency
            generates the update transaction, signs it with node's private key and shares it to other peer nodes via WebSocket protocol.
        </p>
    </div>
}

function NodeEntryLayout({node, save, isLimitUpdates}) {
    const [isEditFormOpen, setIsEditFormOpen] = useState(false)

    const toggleShowForm = useCallback(() => setIsEditFormOpen(isOpen => !isOpen), [])

    const removeNode = useCallback(() => {
        const confirmation = `Do you really want to remove this node?`
        if (confirm(confirmation)) {
            save({
                ...node,
                remove: true
            })
        }
    }, [node, save])

    const onSave = useCallback(node => {
        setIsEditFormOpen(false)
        save(node)
    }, [save])

    return <>
        <div className="space">
            <span>
                <i className="icon-hexagon-dice color-success"/>
                <CopyToClipboard text={node.pubkey} title="Click to copy node public key to clipboard">
                    <AccountAddress account={node.pubkey} chars={16} link={false} style={{cursor: 'pointer'}}/>
                </CopyToClipboard>
            </span>
            {!isLimitUpdates && <span style={{paddingLeft: '1em'}}>
                <a href="#" className="icon-cog" onClick={toggleShowForm} title="Propose to change node settings"/>
                &nbsp;
                <a href="#" className="icon-cancel" onClick={removeNode} title="Propose to remove this node"/>
            </span>}
            <div className="block-indent">
                <span className="dimmed text-small inline-block">{node.domain}</span>&emsp;
                <span className="dimmed text-small node-url-hidden"><span>{node.url}</span></span>
            </div>
        </div>
        {!isLimitUpdates && <AddNodeEntry editNode={node} isEditFormOpen={isEditFormOpen} save={onSave}/>}
    </>
}