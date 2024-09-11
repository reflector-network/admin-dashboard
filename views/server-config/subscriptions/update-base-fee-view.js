import React, {useCallback, useEffect, useState} from 'react'
import {navigation} from '@stellar-expert/navigation'
import detectConfigChanges from '../../util/config-changes-detector'
import ActionNodeLayout from '../action-node-layout'

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

    return <ActionNodeLayout title="Subscription base fee" settings={changedSettings} timeframe={contract?.timeframe} isValid={isValid} description={
        <SubscriptionBaseFeeDescription/>}>
        <div className="row micro-space">
            <div className="column column-50">
                <label>
                    <span className="dimmed text-tiny">
                        Subscription base fee (in stroops)
                    </span>
                    <input type="text" className="micro-space" value={contract?.baseFee || ''} onChange={updateBaseFee}/>
                </label>
            </div>
        </div>
    </ActionNodeLayout>
}

function SubscriptionBaseFeeDescription() {
    return <>
        <p>Basis for the calculation of fees charged by the cluster nodes for subscriptions processing and retention.</p>
        <p>
            This fee is deducted from the subscription XRF balance on the daily basis. Actual amount depends on the base fee,
            heartbeat interval, and subscription assets.
        </p>
    </>
}