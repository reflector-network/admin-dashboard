import React, {useCallback, useEffect, useState} from 'react'
import {getLogFile, getServerLogs, postApi} from '../../api/interface'
import ConfigLayout from '../server-config/config-layout'
import './server-logs-view.scss'

export default function ServerLogsView() {
    const [links, setLinks] = useState(['error.log'])
    const [isTraceEnabled, setIsTraceEnabled] = useState(false)

    const updateTrace = useCallback(e => {
        const enabled = e.target.checked
        postApi('logs/trace', {isTraceEnabled: enabled})
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                notify({type: 'success', message: 'Log trace settings updated'})
                setIsTraceEnabled(enabled)
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to update tracing settings'}))
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
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to load logs'}))
    }, [])
    const tracingControl = <div className="micro-space">
        <label><input type="checkbox" checked={isTraceEnabled} onChange={updateTrace}/> Tracing enabled</label>
    </div>
    return <ConfigLayout title="Server Logs" primaryAction={tracingControl}>
        {links.length ?
            <LogsList links={links}/> :
            <div className="space text-center space dimmed">(no log entries)</div>}
    </ConfigLayout>
}

function LogsList({links}) {
    return <div>
        <div className="dimmed">
            Click to download log file:
        </div>
        <div className="log-file-container row text-small condensed">
            {links.map(link => <div key={link} className="nano-space column column-33">
                <a className="icon-download" data-link={link} onClick={downloadLogFile}>{link}</a>
            </div>)}
        </div>
    </div>
}

function downloadLogFile(e) {
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
        .catch(error => notify({type: 'error', message: error?.message || 'Failed to download logs'}))
}