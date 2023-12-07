import React, {useCallback, useState} from 'react'
import ActionFormLayout, {updateTimeValidation} from './action-form-layout'
import ActionNodeLayout from './action-node-layout'

export default function UpdateContractView({settings}) {
    const [isValid, setIsValid] = useState(false)
    const [changedSettings, setChangedSettings] = useState(structuredClone(settings))

    const validation = useCallback(newSettings => {
        if (changedSettings.config.wasmHash.length !== 64)
            return setIsValid(false)
        if (!updateTimeValidation(newSettings))
            return setIsValid(false)
        setIsValid(true)
    }, [changedSettings])

    const updateWasmHash = useCallback(e => {
        const val = e.target.value
        setChangedSettings(prev => {
            const newSettings = {...prev}
            newSettings.config.wasmHash = val
            validation(newSettings)
            return newSettings
        })
    }, [validation])

    return <ActionNodeLayout settings={changedSettings} currentConfig={settings} isValid={isValid}>
        <h3>Update contract</h3>
        <hr className="flare"/>
        <ActionFormLayout updateSettings={setChangedSettings} validation={validation}>
            <div className="row">
                <div className="column column-90">
                    <label>Wasm hash<br/>
                        <span className="dimmed text-tiny">
                            (Hash of the new contract that will update the code on the blockchain, string of 64 characters)
                        </span>
                        <textarea className="micro-space" style={{maxWidth: '100%', minHeight: 'calc(4em - 1px)'}}
                                  value={changedSettings.config.wasmHash || ''} onChange={updateWasmHash}/>
                    </label>
                </div>
            </div>
        </ActionFormLayout>
    </ActionNodeLayout>
}