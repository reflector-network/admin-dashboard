import React, {useCallback, useEffect, useState} from 'react'
import {Button, ButtonGroup} from '@stellar-expert/ui-framework'

export default function TabularDataView({dataList, updateList, rows = 20, isLoading, children}) {
    const [page, setPage] = useState(1)
    const hiddenButtons = dataList?.length < rows && page === 1

    useEffect(() => updateList(page, rows), [updateList, page, rows])

    const prevPage = useCallback(() => setPage(prev => prev - 1), [])

    const nextPage = useCallback(() => setPage(prev => prev + 1), [])

    if (!dataList)
        return <div className="loader"/>

    return <div>
        {dataList.length ?
            <div className="space">
                {children}
                <div className="text-center space relative">
                    {!hiddenButtons && <ButtonGroup className="space">
                        <Button disabled={isLoading || page === 1} onClick={prevPage}>Prev Page</Button>
                        <Button disabled={isLoading || (!dataList.length || !!(dataList.length % rows))}
                                onClick={nextPage}>Next Page</Button>
                    </ButtonGroup>}
                </div>
            </div> :
            <div className="text-center space dimmed">Could not find data with these parameters</div>}
    </div>
}