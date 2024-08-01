import React, {useCallback, useEffect, useState} from 'react'
import {navigation} from '@stellar-expert/navigation'
import detectConfigChanges from '../util/config-changes-detector'
import ActionNodeLayout from './action-node-layout'

export default function UpdateBaseFeeView({settings, contractId}) {
    const [isValid, setIsValid] = useState(false)
    const [changedSettings, setChangedSettings] = useState(structuredClone(settings))
    const contract = changedSettings.config.contracts[contractId]

    //redirect to main page if contractId from URL params is invalid
    if (!contract || contract.type !== 'subscriptions') {
        navigation.navigate('/')
    }

    useEffect(() => {
        setChangedSettings(structuredClone(settings))
    }, [settings, contractId])

    const validation = useCallback(() => {
        if (!detectConfigChanges(changedSettings.config, settings.config).length)
            return setIsValid(false)
        setIsValid(true)
    }, [contract, changedSettings, settings])

    const updateBaseFee = useCallback(e => {
        const val = e.target.value.replace(/[^0-9]/g, '')
        setChangedSettings(prev => {
            const newSettings = {...prev}
            newSettings.config.contracts[contractId].baseFee = parseInt(val, 10)
            validation()
            return newSettings
        })
    }, [contractId, validation])

    return <ActionNodeLayout title="Effective base fee" settings={changedSettings} timeframe={contract?.timeframe} isValid={isValid}>
        <div className="row micro-space">
            <div className="column column-50">
                <label>
                    <h4 style={{marginBottom: 0}}>Base fee</h4>
                    <span className="dimmed text-tiny">
                        (Network fee required per operation, in stroops)
                    </span>
                    <input type="text" className="micro-space" value={contract?.baseFee || ''} onChange={updateBaseFee}/>
                </label>
            </div>
        </div>
    </ActionNodeLayout>
}