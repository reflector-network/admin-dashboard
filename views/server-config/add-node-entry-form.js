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
    const currentInput = useRef(null)

    useEffect(() => setIsVisible(isEditFormOpen), [isEditFormOpen])

    const toggleShowForm = useCallback(() => {
        setIsVisible(!isVisible)
        setTimeout(() => {
            const input = currentInput.current
            if (input) {
                input.value = editNode?.pubkey || ''
                input.focus()
            }
        }, 200)
    }, [isVisible, editNode])

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
            {!editNode && <input ref={currentInput} value={node.pubkey || ''} placeholder="Node public key"
                                 onChange={onChangePubkey} onKeyDown={onKeyDown}/>}
            <input value={node.url || ''} onChange={onChangeUrl} onKeyDown={onKeyDown}
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