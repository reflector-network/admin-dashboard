import React, {useCallback, useEffect, useRef, useState} from 'react'
import {Button, Dropdown} from '@stellar-expert/ui-framework'



export default function FilterValueView({filterName, updateValue}) {
    const [value, setValue] = useState()
    const filterValue = useRef()

    useEffect(() => {
        const input = filterValue.current
        if (input) {
            setTimeout(() => input.focus(), 200)
        }
    }, [filterName])

    const changeValue = useCallback(e => setValue(e.target.value), [])

    const applyValue = useCallback(() => {
        updateValue({[filterName]: value})
    }, [filterName, value, updateValue])

    const changeDropdownValue = useCallback(val => {
        updateValue({[filterName]: val})
    }, [filterName, updateValue])
    //apply on "Enter"
    const onKeyDown = useCallback(e => {
        if (e.keyCode === 13) {
            applyValue()
        }
    }, [applyValue])

        return <div>

        </div>

}