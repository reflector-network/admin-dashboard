import React, {useCallback, useEffect, useState} from 'react'
import {getLogFile, getServerLogs, postApi} from '../../api/interface'

export default function ConfigurationLogsView() {
    const [links, setLinks] = useState(['error.log'])
    const [isTraceEnabled, setIsTraceEnabled] = useState(false)

    const updateTrace = useCallback(() => {
        postApi('logs/trace', {isTraceEnabled: !isTraceEnabled})
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                notify({type: 'success', message: 'Update completed'})
                setIsTraceEnabled(!isTraceEnabled)
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to update tracing'}))
    }, [isTraceEnabled])

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

    useEffect(() => {
        getServerLogs()
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                setLinks(res.logFiles)
                setIsTraceEnabled(res.isTraceEnabled)
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to get configuration history'}))
    }, [])

    return <div className="segment blank h-100">
        <div>
            <h3>Server logs</h3>
            <hr className="flare"/>
            <div className="space">
                <span className="dimmed">Tracing: </span>
                <span className="inline-block">
                    {isTraceEnabled ? 'Enabled' : 'Disabled'}&emsp;|&emsp;
                    <a onClick={updateTrace} title="Enable/Disable tracing">
                        {!isTraceEnabled ? 'enable' : 'disable'}
                    </a>
                </span>
            </div>
            <div className="space">Download log:</div>
            {links.length ?
                links?.map(link => <div key={link} className="nano-space">
                    <a className="icon-download" data-link={link} onClick={handleDownload}>{link}</a>
                </div>) :
                <div className="space text-center">There are no entries</div>}
        </div>
    </div>
}