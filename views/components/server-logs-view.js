import React, {useCallback, useEffect, useState} from 'react'
import {getLogFile, getServerLogs, postApi} from '../../api/interface'
import ConfigLayout from '../server-config/config-layout'
import TabularDataView from './tabular-data-view'

export default function ConfigurationLogsView() {
    const [links, setLinks] = useState(['error.log'])
    const [isTraceEnabled, setIsTraceEnabled] = useState(false)

    const updateTrace = useCallback(e => {
        const enabled = e.target.checked
        postApi('logs/trace', {isTraceEnabled: enabled})
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                notify({type: 'success', message: 'Trace settings updated'})
                setIsTraceEnabled(enabled)
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to update tracing'}))
    }, [])

    useEffect(() => {
        getServerLogs()
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                //sort logs by newest
                const logs = res.logFiles?.sort((a, b) => b.localeCompare(a))
                setLinks(logs)
                setIsTraceEnabled(res.isTraceEnabled)
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to get configuration history'}))
    }, [])
    const tracingControl = <div className="micro-space">
        <label><input type="checkbox" checked={isTraceEnabled} onChange={updateTrace}/> Tracing enabled</label>
    </div>
    return <ConfigLayout title="Server logs" primaryAction={tracingControl}>
        {links.length ?
            <PaginatedLogView links={links}/> :
            <div className="space text-center">There are no entries</div>}
    </ConfigLayout>
}

function PaginatedLogView({links, limit = 20}) {
    const [partialLinks, setPartialLinks] = useState(links.slice(0, limit))

    const updatePartialLinks = useCallback((page, limit) =>
        setPartialLinks(links.slice(limit * (page - 1), limit * page)), [links])

    const handleDownload = useCallback(e => {
        const link = e.target.dataset.link
        getLogFile(link)
            .then(data => {
                const blob = new Blob([data.logFile], {type: 'application/octet-stream'})
                const downloadUrl = window.URL.createObjectURL(blob)

                //Create a temporary link to trigger the download
                const tempLink = document.createElement('a')
                tempLink.href = downloadUrl
                tempLink.download = link //Set the filename for download
                document.body.appendChild(tempLink)
                tempLink.click()
                document.body.removeChild(tempLink)

                window.URL.revokeObjectURL(downloadUrl)
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to download log'}))
    }, [])

    return <TabularDataView dataList={partialLinks} updateList={updatePartialLinks}>
        {partialLinks.map(link => <div key={link} className="nano-space">
            <a className="icon-download" data-link={link} onClick={handleDownload}>{link}</a>
        </div>)}
    </TabularDataView>
}