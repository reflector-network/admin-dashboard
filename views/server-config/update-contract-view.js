import React, {useCallback, useEffect} from 'react'
import {observer} from 'mobx-react'
import {runInAction} from 'mobx'
import updateRequest from '../../state/config-update-request'
import ActionNodeLayout from './action-node-layout'
import ActionFormLayout from './action-form-layout'

export default observer(function UpdateContractView({settings}) {
    useEffect(() => {
        const updateParams = updateRequest.isConfirmed ? updateRequest.externalRequest : null
        if (updateParams?.wasmHash) {
            runInAction(() => settings.data.wasmHash = updateParams?.wasmHash)
        } else {
            runInAction(() => settings.data.wasmHash = settings.loadedData.wasmHash)
        }
        settings.validate()
    }, [settings, settings.loadedData, updateRequest.isConfirmed])

    const updateWasmHash = useCallback(e => {
        runInAction(() => settings.data.wasmHash = e.target.value)
        settings.validate()
    }, [settings])

    return <ActionNodeLayout settings={settings}>
        <h3>Update contract</h3>
        <hr className="flare"/>
        <ActionFormLayout settings={settings}>
            <div className="row">
                <div className="column column-90">
                    <label>Wasm hash<br/>
                        <span className="dimmed text-tiny">
                            (Hash of the new contract that will update the code on the blockchain, string of 64 characters)
                        </span>
                        <textarea className="micro-space" style={{maxWidth: '100%', minHeight: 'calc(4em - 1px)'}}
                                  value={settings.data.wasmHash || ''} onChange={updateWasmHash}/>
                    </label>
                </div>
            </div>
        </ActionFormLayout>
    </ActionNodeLayout>
})