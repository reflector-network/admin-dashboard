import React, {useCallback, useEffect, useRef, useState} from 'react'
import {Button} from '@stellar-expert/ui-framework'

export default function AddNodeEntry({title, validation, editNode, isEditFormOpen, save}) {
    const [isVisible, setIsVisible] = useState(isEditFormOpen)
    const [isValid, setIsValid] = useState(false)
    const [node, setNode] = useState(editNode || {})
    const currentInput = useRef(null)

    useEffect(() => {
        setIsVisible(isEditFormOpen)
    }, [isEditFormOpen])

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

    const validate = useCallback(newNode => {
        setIsValid(validation(newNode))
    }, [validation])

    const onChangePubkey = useCallback(e => {
        const val = e.target.value.trim()
        const newNode = {...node, pubkey: val}
        setNode(newNode)
        validate(newNode)
    }, [node, validate])

    const onChangeUrl = useCallback(e => {
        const val = e.target.value.trim()
        const newNode = {...node, url: val}
        setNode(newNode)
        validate(newNode)
    }, [node, validate])

    const onSave = useCallback(() => {
        save(node)
        toggleShowForm()
    }, [node, save, toggleShowForm])
    //save on "Enter"
    const onKeyDown = useCallback(function (e) {
        if (e.keyCode === 13 && isValid) {
            onSave()
        }
    }, [isValid, onSave])

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