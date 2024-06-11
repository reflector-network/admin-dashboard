import React, {useCallback, useEffect, useState} from 'react'
import {AccountAddress, CopyToClipboard} from '@stellar-expert/ui-framework'
import configChangesDetector from '../util/config-changes-detector'
import ActionNodeLayout from './action-node-layout'
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
        if (!configChangesDetector(changedSettings.config, settings.config).length)
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

    return <ActionNodeLayout settings={changedSettings} isValid={isValid}>
        <h3>Peer nodes</h3>
        <hr className="flare"/>
        <div className="space"/>
        <h4>Quorum nodes</h4>
        {Object.values(changedSettings.config.nodes || {}).map(node => !node.remove &&
            <NodeEntryLayout key={node.pubkey} node={node} save={saveNode} isLimitUpdates={isLimitUpdates}/>)}
        <div className="space"/>
        {!isLimitUpdates && <AddNodeEntry title={<><i className="icon-plus"/>Add new node</>} save={saveNode}/>}
    </ActionNodeLayout>
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
            <span><i className="icon-hexagon-dice color-success"/><AccountAddress account={node.pubkey} chars={16} link={false}/></span>
            <span>
                <CopyToClipboard text={node.pubkey} title="Copy public key to clipboard"/>
                {!isLimitUpdates && <a href="#" className="icon-cog" onClick={toggleShowForm}/>}
                {!isLimitUpdates && <a href="#" className="icon-cancel" onClick={removeNode}/>}
            </span>
            <div className="block-indent">
                <span className="dimmed text-small inline-block" style={{minWidth:'16em'}}>{node.domain}</span>&emsp;
                <span className="dimmed text-small node-url-hidden"><span>{node.url}</span></span>
            </div>
        </div>
        {!isLimitUpdates && <AddNodeEntry editNode={node} isEditFormOpen={isEditFormOpen} save={onSave}/>}
    </>
}