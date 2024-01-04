import React, {useCallback, useEffect, useState} from 'react'
import {getServerLogs, postApi} from '../../api/interface'

export default function ConfigurationLogsView() {
    const [links, setLinks] = useState([])
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

    useEffect(() => {
        getServerLogs()
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                setLinks(res)
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
                    <a href="#" onClick={updateTrace} title="Enable/Disable tracing">
                        {!isTraceEnabled ? 'enable' : 'disable'}
                    </a>
                </span>
            </div>
            <div className="space">Download log:</div>
            {links.length ?
                links?.map(link => <div key={link} className="nano-space">
                    <a href={apiOrigin + `logs/download/${link}`} target="_blank" rel="noreferrer" download={link}>
                        <span className="icon-download">{link}</span></a>
                </div>) :
                <div className="space text-center">There are no entries</div>}
        </div>
    </div>
}