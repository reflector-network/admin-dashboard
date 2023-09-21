import React, {useEffect, useState} from 'react'
import {Button, CopyToClipboard} from '@stellar-expert/ui-framework'
import {getConfig} from '../../api/interface'

export default function ConfigSharingSectionView() {
    const [configLink, setConfigLink] = useState()

    useEffect(() => {
        getConfig()
            .then(currentConfig => {
                if (currentConfig.error)
                    throw new Error(currentConfig.error)
                const encodedData = encodeURIComponent(JSON.stringify(currentConfig))
                setConfigLink(window.location.origin + '/config?update=' + encodedData)
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to load config'}))
    }, [])


    return <div className="segment blank">
        <div>
            <h3>Share server config</h3>
            <hr className="flare"/>
            {!configLink ? <div className="loader"/> :
                <div>
                    <div className="space dimmed text-small">
                        You can share this link with new quorum participants to add new node to the quorum set.
                    </div>
                    <textarea readOnly style={{width: '100%', height: '10em'}}>{configLink}</textarea>
                    <div className="row">
                        <div className="column column-33 column-offset-66">
                            <CopyToClipboard text={configLink}><Button className="button-block">Copy config link</Button></CopyToClipboard>
                        </div>
                    </div>
                </div>}
        </div>
    </div>
}