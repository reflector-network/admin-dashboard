import React, {useCallback, useEffect, useRef, useState} from 'react'
import {Button} from '@stellar-expert/ui-framework'
import {StrKey} from 'stellar-sdk'

function validateNode(node) {
    if (!StrKey.isValidEd25519PublicKey(node.pubkey))
        return
    if (!node.url?.length)
        return
    return true
}

export default function AddNodeEntry({title, editNode, isEditFormOpen, save}) {
    const [isVisible, setIsVisible] = useState(isEditFormOpen)
    const [isValid, setIsValid] = useState(false)
    const [node, setNode] = useState(editNode || {})
    const pubkeyInput = useRef(null)
    const urlInput = useRef(null)

    useEffect(() => setIsVisible(isEditFormOpen), [isEditFormOpen])

    useEffect(() => {
        setTimeout(() => {
            const input = pubkeyInput.current ? pubkeyInput.current : urlInput.current
            if (isVisible && input) {
                input.focus()
            }
        }, 200)
    }, [isVisible])

    const toggleShowForm = useCallback(() => {
        setIsVisible(prev => !prev)
    }, [])

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
        {!!isVisible && <div className="micro-space">
            {!editNode && <input ref={pubkeyInput} value={node.pubkey || ''} placeholder="Node public key"
                                 onChange={onChangePubkey} onKeyDown={onKeyDown}/>}
            <input ref={urlInput} value={node.url || ''} onChange={onChangeUrl} onKeyDown={onKeyDown}
                   placeholder="Node websocket URL, like ws://127.0.0.1:9000"/>
            <div className="row micro-space">
                <div className="column column-50">
                    <Button block disabled={!isValid} onClick={onSave}>Save</Button>
                </div>
                <div className="column column-50">
                    <Button block outline onClick={toggleShowForm}>Cancel</Button>
                </div>
            </div>
        </div>}
    </span>
}