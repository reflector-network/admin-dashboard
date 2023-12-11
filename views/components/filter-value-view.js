import React, {useCallback, useEffect, useRef, useState} from 'react'
import {Button, Dropdown} from '@stellar-expert/ui-framework'

const statusOptions = [
    {title: 'Applied', value: 'applied'},
    {title: 'Pending', value: 'pending'},
    {title: 'Rejected', value: 'rejected'},
    {title: 'Voting', value: 'voting'}
]

export default function FilterValueView({filterName, updateValue}) {
    const [value, setValue] = useState()
    const filterValue = useRef()

    useEffect(() => {
        const input = filterValue.current
        if (input) {
            setTimeout(() => input.focus(), 200)
        }
    }, [])

    const changeValue = useCallback(e => setValue(e.target.value), [])

    const applyValue = useCallback(() => {
        updateValue({[filterName]: value})
    }, [filterName, value, updateValue])

    const changeDropdownValue = useCallback(val => {
        updateValue({[filterName]: val})
    }, [filterName, updateValue])
    //apply on "Enter"
    const onKeyDown = useCallback(e => applyValue(e.keyCode === 13), [applyValue])

    if (filterName === 'status')
        return <div>
            <Dropdown className="micro-space" title="Status" options={statusOptions} onChange={changeDropdownValue}/>
        </div>

    return <div className="row">
        <div className="column column-75">
            <div className="row">
                <div className="column column-75">
                    <input ref={filterValue} value={value || ''} onChange={changeValue} onKeyDown={onKeyDown} placeholder="Value"/>
                </div>
                <div className="column column-25">
                    <Button block onClick={applyValue}>Apply</Button>
                </div>
            </div>
        </div>
    </div>
}