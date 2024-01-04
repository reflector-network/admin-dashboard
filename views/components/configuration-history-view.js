import React, {useCallback, useState} from 'react'
import {AccountAddress, Button, CodeBlock, UtcTimestamp} from '@stellar-expert/ui-framework'
import {getConfigHistory} from '../../api/interface'
import invocationFormatter from '../util/invocation-formatter'
import TabularDataView from './tabular-data-view'
import ConfigFiltersView from './config-filter-view'
import DialogView from './dialog-view'

export default function ConfigurationHistoryView() {
    const [history, setHistory] = useState()
    const [filters, setFilters] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [config, setConfig] = useState()
    const [isOpen, setIsOpen] = useState(false)
    const readonlyConfigProperties = invocationFormatter(config || {}, 1)

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

    const toggleShowConfig = useCallback(() => setIsOpen(prev => !prev), [])

    const showConfig = useCallback(e => {
        const id = e.target.dataset.id
        if (!id)
            return
        setConfig(history.filter(config => config.id === id)[0])
        toggleShowConfig()
    }, [history, toggleShowConfig])

    return <div className="segment blank h-100">
        <div>
            <h3>Configuration history</h3>
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
                            <th/>
                        </tr>
                    </thead>
                    <tbody className="condensed">
                        {history.map(config => {
                            const nodeDomains = Object.values(config.config.nodes).reduce((prev, curr) => {
                                prev[curr.pubkey] = curr.domain
                                return prev
                            }, {})
                            const signatures = config.signatures.map(signature => <div key={signature.pubkey}>
                                {nodeDomains[signature.pubkey] ?
                                    <span title={signature.pubkey}>{nodeDomains[signature.pubkey]}</span> :
                                    <AccountAddress account={signature.pubkey} char={16}/>}
                            </div>)
                            return <tr key={config.id}>
                                <td data-header="Description: ">{config.description || 'no desc'}</td>
                                <td data-header="Initiator: ">
                                    {nodeDomains[config.initiator] ?
                                        <span title={config.initiator}>{nodeDomains[config.initiator]}</span> :
                                        <AccountAddress account={config.initiator} char={16}/>}
                                </td>
                                <td data-header="Signatures: ">{signatures}</td>
                                <td data-header="Status: ">{config.status}</td>
                                <td data-header="Expiration date: ">
                                    <UtcTimestamp date={config.expirationDate} dateOnly/>
                                </td>
                                <td><a className="icon-open-new-window" data-id={config.id} onClick={showConfig}/></td>
                            </tr>
                        })}
                    </tbody>
                </table> :
                <div className="text-center space dimmed">Could not find any configurations with this option</div>}
            </TabularDataView>
        </div>
        <DialogView dialogOpen={isOpen}>
            {!!config && <div>
                <h3>Quorum configuration file</h3>
                <hr className="flare"/>
                <div className="space">
                    <CodeBlock className="result" style={{height: '50vh'}} lang="js">{readonlyConfigProperties}</CodeBlock>
                </div>
            </div>}
            <div className="row space">
                <div className="column column-25 column-offset-75">
                    <Button block onClick={toggleShowConfig}>Close</Button>
                </div>
            </div>
        </DialogView>
    </div>
}