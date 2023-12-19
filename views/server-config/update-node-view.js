import React, {useCallback, useState} from 'react'
import {AccountAddress, CopyToClipboard} from '@stellar-expert/ui-framework'
import ActionFormLayout, {updateTimeValidation} from './action-form-layout'
import ActionNodeLayout from './action-node-layout'
import AddNodeEntry from './add-node-entry-form'

export default function UpdateNodeView({settings}) {
    const [isValid, setIsValid] = useState(false)
    const [changedSettings, setChangedSettings] = useState(structuredClone(settings))
    const [isLimitUpdates, setIsLimitUpdates] = useState(false)

    const validation = useCallback(newSettings => {
        if (!updateTimeValidation(newSettings))
            return setIsValid(false)
        setIsValid(true)
    }, [])

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

    return <ActionNodeLayout settings={changedSettings} currentConfig={settings} isValid={isValid}>
        <h3>Peer nodes</h3>
        <hr className="flare"/>
        <ActionFormLayout updateSettings={setChangedSettings} validation={validation}>
            <h3>Quorum nodes</h3>
            {Object.values(changedSettings.config.nodes || {}).map(node => !node.remove &&
                <NodeEntryLayout key={node.pubkey} node={node} save={saveNode} isLimitUpdates={isLimitUpdates}/>)}
            <div className="space"/>
            {!isLimitUpdates && <AddNodeEntry title={<><i className="icon-plus"/>Add new node</>} save={saveNode}/>}
        </ActionFormLayout>
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
            <div>
                <span className="dimmed text-small">&emsp;&emsp;{node.url}</span>
                <span className="dimmed text-small">&emsp;&emsp;{node.domain}</span>
            </div>
        </div>
        {!isLimitUpdates && <AddNodeEntry editNode={node} isEditFormOpen={isEditFormOpen} save={onSave}/>}
    </>
}