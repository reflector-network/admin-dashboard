import React, {useCallback, useState} from 'react'
import {Dropdown} from '@stellar-expert/ui-framework'

const statusOptions = [
    {title: 'All', value: ''},
    {title: 'Applied', value: 'applied'},
    {title: 'Pending', value: 'pending'},
    {title: 'Rejected', value: 'rejected'},
    {title: 'Voting', value: 'voting'}
]

export default function ConfigFiltersView({updateFilters}) {
    const [value, setValue] = useState('')
    const setFilterValue = useCallback(val => {
        const status = typeof val === 'string' ? val : val.value
        setValue(status)
        updateFilters(prev => ({status}))
    }, [updateFilters])


    return <div className="micro-space">
        <span className="icon-filter"/>Status:&nbsp;<Dropdown options={statusOptions} value={value} onChange={setFilterValue}/>
    </div>
}