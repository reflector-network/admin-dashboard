import React, {useCallback, useEffect, useState} from 'react'
import {navigation} from '@stellar-expert/navigation'
import ActionFormLayout, {updateTimeValidation} from './action-form-layout'
import ActionNodeLayout from './action-node-layout'

export default function UpdatePeriodView({settings, contractId}) {
    const [isValid, setIsValid] = useState(false)
    const [changedSettings, setChangedSettings] = useState(structuredClone(settings))
    const contract = changedSettings.config.contracts[contractId]

    //Redirect to main page if contractId from URL params is invalid
    if (!contract) {
        navigation.navigate('/')
    }

    useEffect(() => {
        setChangedSettings(structuredClone(settings))
    }, [settings, contractId])

    const validation = useCallback(newSettings => {
        if (contract.period <= contract.timeframe)
            return setIsValid(false)
        if (!updateTimeValidation(newSettings))
            return setIsValid(false)
        setIsValid(true)
    }, [contract])

    const updatePeriod = useCallback(e => {
        const val = e.target.value.replace(/[^0-9]/g, '')
        setChangedSettings(prev => {
            const newSettings = {...prev}
            newSettings.config.contracts[contractId].period = parseInt(val, 10)
            validation(newSettings)
            return newSettings
        })
    }, [contractId, validation])

    return <ActionNodeLayout settings={changedSettings} isValid={isValid}>
        <h3>Retention period</h3>
        <hr className="flare"/>
        <ActionFormLayout timeframe={contract.timeframe} updateSettings={setChangedSettings} validation={validation}>
            <div className="row">
                <div className="column column-50">
                    <label>Price quotes retention period<br/>
                        <span className="dimmed text-tiny">
                            (How long quoted prices will be available for contract consumers after creation, in milliseconds)
                        </span>
                        <input type="text" className="micro-space" value={contract?.period || ''} onChange={updatePeriod}/>
                    </label>
                </div>
            </div>
        </ActionFormLayout>
    </ActionNodeLayout>
}