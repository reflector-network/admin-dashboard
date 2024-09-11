import React, {useCallback, useEffect, useState} from 'react'
import {navigation} from '@stellar-expert/navigation'
import detectConfigChanges from '../../util/config-changes-detector'
import ActionNodeLayout from '../action-node-layout'

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

    return <ActionNodeLayout title="Price quotes retention period" settings={changedSettings} timeframe={contract?.timeframe} isValid={isValid} description={
        <UpdatePeriodDescription/>}>
        <div className="row micro-space">
            <div className="column column-50">
                <label>
                    <span className="dimmed text-tiny">
                        Retention period (in milliseconds)
                    </span>
                    <input type="text" className="micro-space" value={contract?.period || ''} onChange={updatePeriod}/>
                </label>
            </div>
        </div>
    </ActionNodeLayout>
}

function UpdatePeriodDescription() {
    return <>
        <p>
            Retention period determines how long quoted prices will be available for contract consumers after creation.
        </p>
        <p>
            Price feeds receive updates regularly. Reflector oracles operate non-stop nad price data is written to the temporary storage and
            can be evicted over time.
        </p>
    </>
}