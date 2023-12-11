import React, {useCallback, useState} from 'react'
import {AccountAddress, UtcTimestamp} from '@stellar-expert/ui-framework'
import {getConfigHistory} from '../../api/interface'
import TabularDataView from '../components/tabular-data-view'
import ConfigFiltersView from '../components/config-filter-view'

export default function ConfigurationHistoryView() {
    const [history, setHistory] = useState()
    const [filters, setFilters] = useState({})
    const [isLoading, setIsLoading] = useState(false)

    const updateConfigHistory = useCallback((page, numberRows) => {
        const params = {
            pageSize: numberRows,
            page
        }
        if (filters.initiator)
            params.initiator = filters.initiator
        if (filters.status)
            params.status = filters.status

        setIsLoading(true)
        getConfigHistory(params)
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                setHistory(res)
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to get configuration history'}))
            .finally(() => setIsLoading(false))
    }, [filters])

    return <div className="segment blank h-100">
        <div>
            <h3>Configuration histor</h3>
            <hr className="flare"/>
            <TabularDataView dataList={history} updateList={updateConfigHistory} isLoading={isLoading}>
                <ConfigFiltersView filters={filters} updateFilters={setFilters}/>
                {history?.length ? <table className="table space">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Initiator</th>
                            <th>Signatures</th>
                            <th>Status</th>
                            <th>Expiration date</th>
                        </tr>
                    </thead>
                    <tbody className="condensed">
                        {history.map(config => {
                            const signatures = config.signatures.map(signature => <div key={signature.pubkey}>
                                <AccountAddress account={signature.pubkey} chars={12}/>
                            </div>)
                            return <tr key={config.id}>
                                <td data-header="Description: ">{config.description}</td>
                                <td data-header="Initiator: ">
                                    <AccountAddress account={config.initiator} chars={12}/>
                                </td>
                                <td data-header="Signatures: ">{signatures}</td>
                                <td data-header="Status: ">{config.status}</td>
                                <td data-header="Expiration date: ">
                                    <UtcTimestamp date={config.expirationDate} dateOnly/>
                                </td>
                            </tr>
                        })}
                    </tbody>
                </table> :
                <div className="text-center space dimmed">Could not find any configurations with this option</div>}
            </TabularDataView>
        </div>
    </div>
}