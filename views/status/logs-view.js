import React, {useEffect, useState} from 'react'
import {Dropdown, withErrorBoundary} from '@stellar-expert/ui-framework'
import {getLogFile, getNodePublicKeys, getServerLogs} from '../../api/interface'

export default function LogsView() {
    const [availableNodes, setAvailableNodes] = useState()
    const [selectedNode, setSelectedNode] = useState()
    useEffect(() => {
        getNodePublicKeys()
            .then(keys => {
                setAvailableNodes(keys)
            })
    }, [])


    if (!availableNodes)
        return <div className="loader"/>
    if (availableNodes.error)
        return <div className="segment error">
            <h3>Failed to node names</h3>
            <div className="space text-small">{availableNodes.error}</div>
        </div>

    return <div className="segment blank">
        <div>
            <h3 style={{padding: 0}}>
                <i className="icon-hexagon-dice"/>
                Node Logs for{' '}
                <Dropdown options={availableNodes} onChange={setSelectedNode} value={selectedNode} title={selectedNode || 'choose node'}/>
            </h3>
            <hr className="flare"/>
            <NodeLogs node={selectedNode}/>
        </div>
    </div>
}

const NodeLogs = withErrorBoundary(function NodeLogs({node, type}) {
    const [logs, setLogs] = useState()
    useEffect(() => {
        if (!node) {
            setLogs(null)
            return
        }
        getServerLogs(node)
            .then(logs => {
                if (logs.error)
                    throw new Error(logs.error)
                //getting the latest data
                setLogs(logs)
            })
            .catch((error) => {
                notify({
                    type: 'error',
                    message: 'Failed to retrieve logs. ' + (error?.message || '')
                })
                setLogs(null)
            })
    }, [node, type])


    if (!node)
        return null

    if (!logs)
        return <div className="loader"/>
    if (logs.error)
        return <div className="segment error">
            <h3>Failed to load logs</h3>
            <div className="space text-small">{logs.error}</div>
        </div>

    return <div>
        {logs.logFiles.map(link => <div key={link} className="nano-space">
            <a className="icon-download" data-link={link} data-node={node} onClick={downloadFile}>{link}</a>
        </div>)}
    </div>
})

function downloadFile(e) {
    const {link, node} = e.target.dataset
    getLogFile(link, node)
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