import React, {useCallback, useEffect, useState} from 'react'
import {navigation} from '@stellar-expert/navigation'
import detectConfigChanges from '../util/config-changes-detector'
import ActionNodeLayout from './action-node-layout'

export default function UpdatePeriodView({settings, contractId}) {
    const [isValid, setIsValid] = useState(false)
    const [changedSettings, setChangedSettings] = useState(structuredClone(settings))
    const contract = changedSettings.config.contracts[contractId]

    //redirect to main page if contractId from URL params is invalid
    if (!contract) {
        navigation.navigate('/')
    }

    useEffect(() => {
        setChangedSettings(structuredClone(settings))
    }, [settings, contractId])

    const validation = useCallback(() => {
        if (contract.period <= contract.timeframe)
            return setIsValid(false)
        if (!detectConfigChanges(changedSettings.config, settings.config).length)
            return setIsValid(false)
        setIsValid(true)
    }, [contract, changedSettings, settings])

    const updatePeriod = useCallback(e => {
        const val = e.target.value.replace(/[^0-9]/g, '')
        setChangedSettings(prev => {
            const newSettings = {...prev}
            newSettings.config.contracts[contractId].period = parseInt(val, 10)
            validation(newSettings)
            return newSettings
        })
    }, [contractId, validation])

    return <ActionNodeLayout title="Retention period" settings={changedSettings} timeframe={contract?.timeframe} isValid={isValid}>
        <div className="row micro-space">
            <div className="column column-50">
                <label>
                    <h4 style={{marginBottom: 0}}>Price quotes retention period</h4>
                    <span className="dimmed text-tiny">
                        (How long quoted prices will be available for contract consumers after creation, in milliseconds)
                    </span>
                    <input type="text" className="micro-space" value={contract?.period || ''} onChange={updatePeriod}/>
                </label>
            </div>
        </div>
    </ActionNodeLayout>
}