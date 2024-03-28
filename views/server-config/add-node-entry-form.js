import React, {useCallback, useEffect, useRef, useState} from 'react'
import {AccountAddress, Button} from '@stellar-expert/ui-framework'
import {StrKey} from '@stellar/stellar-sdk'
import DialogView from '../components/dialog-view'

function validateNode(node) {
    if (!StrKey.isValidEd25519PublicKey(node.pubkey))
        return
    const pattern = new RegExp(/^(http:\/\/|https:\/\/|ws:\/\/|wss:\/\/)?(localhost|(([0-9]{1,3}\.){3}[0-9]{1,3})|([\da-z.-]+)\.([a-z.]{2,6}))(:(\d+))?$/)
    if (!node.url?.length || !pattern.test(node.url))
        return
    if (!node.domain?.length)
        return
    return true
}

export default function AddNodeEntry({title, editNode, isEditFormOpen, save}) {
    const [isOpen, setIsOpen] = useState(isEditFormOpen)
    const [isValid, setIsValid] = useState(false)
    const [node, setNode] = useState(editNode || {})
    const pubkeyInput = useRef(null)
    const urlInput = useRef(null)

    useEffect(() => setIsOpen(isEditFormOpen), [isEditFormOpen])

    useEffect(() => {
        setTimeout(() => {
            const input = pubkeyInput.current ? pubkeyInput.current : urlInput.current
            if (isOpen && input) {
                input.focus()
            }
        }, 200)
    }, [isOpen])

    const toggleShowForm = useCallback(() => setIsOpen(prev => !prev), [])

    const onChangePubkey = useCallback(e => {
        setNode(prev => {
            const newNode = {...prev, pubkey: e.target.value.trim()}
            setIsValid(validateNode(newNode))
            return newNode
        })
    }, [])

    const onChangeUrl = useCallback(e => {
        setNode(prev => {
            const newNode = {...prev, url: e.target.value.trim()}
            setIsValid(validateNode(newNode))
            return newNode
        })
    }, [])

    const onChangeDomain = useCallback(e => {
        setNode(prev => {
            const newNode = {...prev, domain: e.target.value.trim()}
            setIsValid(validateNode(newNode))
            return newNode
        })
    }, [])

    const onSave = useCallback(() => {
        save(node)
        toggleShowForm()
    }, [node, save, toggleShowForm])
    //save on "Enter"
    const onKeyDown = useCallback(function (e) {
        if (e.keyCode === 13 && isValid) {
            onSave(node)
        }
    }, [isValid, node, onSave])

    return <span>
        {!!title && <a onClick={toggleShowForm}>{title}</a>}
        <DialogView dialogOpen={isOpen} smaller>
            <h3>
                {!editNode ? 'Add new node' :
                <span>{'Edit node '}<i className="icon-hexagon-dice color-success"/><AccountAddress account={node.pubkey} chars={16} link={false}/></span>}
            </h3>
            <div className="space"/>
            {!editNode && <input ref={pubkeyInput} value={node.pubkey || ''} placeholder="Node public key"
                                 onChange={onChangePubkey} onKeyDown={onKeyDown}/>}
            <input ref={urlInput} value={node.url || ''} onChange={onChangeUrl} onKeyDown={onKeyDown}
                   placeholder="Node websocket URL, like ws://127.0.0.1:9000"/>
            <input value={node.domain || ''} onChange={onChangeDomain} onKeyDown={onKeyDown}
                   placeholder="Domain"/>
            <div className="row micro-space">
                <div className="column column-33 column-offset-33">
                    <Button block disabled={!isValid} onClick={onSave}>Confirm</Button>
                </div>
                <div className="column column-33">
                    <Button block outline onClick={toggleShowForm}>Cancel</Button>
                </div>
            </div>
        </DialogView>
    </span>
}