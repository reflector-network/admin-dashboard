import React, {useCallback, useEffect, useState} from 'react'
import {Button, ButtonGroup, Dropdown} from '@stellar-expert/ui-framework'

export default function TabularDataView({dataList, updateList, rows = 10, isLoading, children}) {
    const [page, setPage] = useState(1)
    const [numberRows, setNumberRows] = useState(rows)

    useEffect(() => setPage(1), [numberRows])

    useEffect(() => {
        updateList(page, numberRows)
    }, [updateList, page, numberRows])

    const prevPage = useCallback(() => setPage(prev => prev - 1), [])

    const nextPage = useCallback(() => setPage(prev => prev + 1), [])

    const changeRows = useCallback(rows => setNumberRows(rows), [])


    return <div>
        {dataList ?
            <div className="space">
                {children}
                <div className="text-center space relative">
                    <Dropdown className="row-selector micro-space" title={numberRows} options={['5', '10', '20', '50']} onChange={changeRows}/>
                    <ButtonGroup className="space">
                        <Button disabled={isLoading || page === 1} onClick={prevPage}>Prev Page</Button>
                        <Button disabled={isLoading || (!dataList.length || !!(dataList.length % numberRows))}
                                onClick={nextPage}>Next Page</Button>
                    </ButtonGroup>
                </div>
            </div> :
            <div className="text-center space dimmed">You don't have any entries yet</div>}
    </div>
}