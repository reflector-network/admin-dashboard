import React, {useCallback, useEffect, useState} from 'react'
import {AccountAddress, Button, CodeBlock, UtcTimestamp} from '@stellar-expert/ui-framework'
import {getConfigHistory, getTx} from '../../api/interface'
import invocationFormatter from '../util/invocation-formatter'
import ConfigLayout from '../server-config/config-layout'
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

    const updateConfigHistory = useCallback((page = 1, numberRows = 20) => {
        const params = {
            pageSize: numberRows,
            page
        }
        if (filters.status) {
            params.status = filters.status
        }

        setIsLoading(true)
        getConfigHistory(params)
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                setHistory(res)
            })
            .catch(error => {
                notify({type: 'error', message: error?.message || 'Failed to load configuration changes history'})
                setHistory(null)
            })
            .finally(() => setIsLoading(false))
    }, [filters])

    useEffect(() => updateConfigHistory(), [updateConfigHistory])

    const toggleShowConfig = useCallback(() => setIsOpen(prev => !prev), [])

    const showConfig = useCallback(e => {
        const id = e.target.dataset.id
        if (!id)
            return
        setConfig(history.filter(config => config.id === id)[0])
        toggleShowConfig()
    }, [history, toggleShowConfig])

    if (history === undefined)
        return <div className="loader"/>

    return <ConfigLayout title="Configuration history">
        {history ?
            <>
                <ConfigFiltersView filters={filters} updateFilters={setFilters}/>
                <TabularDataView dataList={history} updateList={updateConfigHistory} isLoading={isLoading}>
                    <table className="table space">
                        <thead>
                        <tr>
                            <th>Status</th>
                            <th>Signatures</th>
                            <th>Description</th>
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
                                <td data-header="Status: ">
                                    {config.status === 'replaced' ? 'applied' : config.status}
                                    <div className="dimmed text-tiny">
                                        {(config.status !== 'pending' && config.txhash) ?
                                            <TxLinkView config={config}/> :
                                            <UtcTimestamp date={config.expirationDate}/>}
                                    </div>
                                </td>
                                <td data-header="Signatures: ">{signatures}</td>
                                <td className="word-break" data-header="Description: ">{config.description || 'no desc'}</td>
                                <td className="collapsing"><a className="icon-info text-tiny" data-id={config.id} onClick={showConfig}/>
                                </td>
                            </tr>
                        })}
                        </tbody>
                    </table>
                </TabularDataView>
            </> :
            <div className="text-center double-space dimmed text-small">(no changes history yet)</div>}
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
    </ConfigLayout>
}

function TxLinkView({config}) {
    const txLink = `${explorerFrontendOrigin}/explorer/${config.config.network}/tx/${config.txhash}`
    const [timestamp, setTimestamp] = useState(0)

    useEffect(() => {
        getTx(config.txhash)
            .then(tx => setTimestamp(tx.created_at))
            .catch(error => console.error(error))
    }, [config])

    if (!timestamp)
        return <UtcTimestamp date={config.expirationDate}/>

    return <a href={txLink} target="_blank" rel="noreferrer">
        <UtcTimestamp date={timestamp}/>
    </a>
}