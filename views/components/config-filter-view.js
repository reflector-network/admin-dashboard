import React, {useCallback, useState} from 'react'
import {Dropdown} from '@stellar-expert/ui-framework'
import {shortenString} from '@stellar-expert/formatter'
import FilterValueView from './filter-value-view'

const filterList = [
    {title: 'Find by initiator', value: 'initiator'},
    {title: 'Find by status', value: 'status'}
]

export default function ConfigFiltersView({filters, updateFilters}){
    const [isVisible, setIsVisible] = useState(false)
    const [filterName, setFilterName] = useState('')

    const addFilter = useCallback(type => {
        setIsVisible(true)
        setFilterName(type)
    }, [])

    const addFilterValue = useCallback(val => {
        updateFilters(prev => ({...prev, [filterName]: val[filterName]}))
        setIsVisible(false)
    }, [filterName, updateFilters])

    const resetFilters = useCallback(() => updateFilters({}), [updateFilters])

    return <div className="micro-space">
        <span className="icon-filter"/>&nbsp;Filters:&emsp;
        {!!Object.keys(filters).length && <>
            {Object.keys(filters).map(param => param && <span key={param}>
                <code>{param === 'initiator' ? shortenString(filters[param]) : filters[param]}</code>&nbsp;&nbsp;
            </span>)}
            <a onClick={resetFilters} title="Reset"><span className="icon icon-delete-circle"/></a>&emsp;
        </>}
        <Dropdown className="micro-space" title="Add filter" options={filterList} onChange={addFilter}/>
        <div className="micro-space">
            {!!isVisible && <FilterValueView filterName={filterName} updateValue={addFilterValue}/>}
        </div>
    </div>
}