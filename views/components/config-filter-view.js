import React, {useCallback, useRef, useState} from 'react'
import {Dropdown} from '@stellar-expert/ui-framework'
import {shortenString} from '@stellar-expert/formatter'
import FilterValueView from './filter-value-view'

const filterList = [
    {title: 'Find by initiator', value: 'initiator'},
    {title: 'Find by status', value: 'status'}
]

export default function ConfigFiltersView({filters, updateFilters}){
    const [isVisible, setIsVisible] = useState(false)
    const filterName = useRef()

    const addFilter = useCallback(type => {
        setIsVisible(true)
        filterName.current = type
    }, [])

    const addFilterValue = useCallback(val => {
        const name = filterName.current
        updateFilters(prev => ({...prev, [name]: val[name]}))
        setIsVisible(false)
    }, [updateFilters])

    const resetFilters = useCallback(() => updateFilters({}), [updateFilters])

    return <div className="micro-space">
        <span className="icon-filter"/>&nbsp;Filters:&emsp;
        {!!Object.keys(filters).length && <>
            {Object.keys(filters).map(param => param && <span key={param}>
                <code>{param === 'initiator' ? shortenString(filters[param]) : filters[param]}</code>&nbsp;&nbsp;
            </span>)}
            <a onClick={resetFilters} title='Reset'><span className="icon icon-delete-circle"/></a>&emsp;
        </>}
        <Dropdown className="micro-space" title="Add filter" options={filterList} onChange={addFilter}/>
        <div className="micro-space">
            {!!isVisible && <FilterValueView filterName={filterName.current} updateValue={addFilterValue}/>}
        </div>
    </div>
}