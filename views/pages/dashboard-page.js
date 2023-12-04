import React, {useEffect, useState} from 'react'
import {getCurrentConfig} from '../../api/interface'
import SettingsSection from '../components/settings-view'
import NodeStatisticsView from '../components/node-statistics-view'
import UpdateNodeNavigationView from '../components/update-node-navigation-view'
import ConfigChangesView from '../components/config-changes-view'
import UpdateRequestVotingView from '../components/update-request-voting-view'

const testConfig = {
    "config": {
        "contracts": [
            {
            "admin": "GA2TOMXHBTPOOWQL5GDNGSHYE2C3Q6DWGEJUWD3IPJYIRF5FWXIOV2TP",
            "assets": [
                {
                "code": "USD:GB5DYOR2IMDERGOB6C67I2ENSFJXCZ2OZACDF2MRUWAPX2NCKSSZC5G5",
                "type": 1
                },
                {
                "code": "EUR:GB5DYOR2IMDERGOB6C67I2ENSFJXCZ2OZACDF2MRUWAPX2NCKSSZC5G5",
                "type": 1
                },
                {
                "code": "UAH:GB5DYOR2IMDERGOB6C67I2ENSFJXCZ2OZACDF2MRUWAPX2NCKSSZC5G5",
                "type": 1
                }
            ],
            "baseAsset": {
                "code": "XLM",
                "type": 1
            },
            "decimals": 14,
            "fee": 1000000,
            "network": "testnet",
            "oracleId": "CC45BIBNGNXHLPJJRZZEGHNJSBAXC7FULN642JZ7VSIYKIAZGSSEZJVE",
            "period": 40000000,
            "timeframe": 300000
            },
            {
            "admin": "GB37DH4CM64RFUJ4LVNGTECDITMYELOBFUW7CR36644JZMFYZA3UBHQW",
            "assets": [
                {
                "code": "AUD:GB37DH4CM64RFUJ4LVNGTECDITMYELOBFUW7CR36644JZMFYZA3UBHQW",
                "type": 1
                },
                {
                "code": "BRL:GB37DH4CM64RFUJ4LVNGTECDITMYELOBFUW7CR36644JZMFYZA3UBHQW",
                "type": 1
                },
                {
                "code": "CAD:GB37DH4CM64RFUJ4LVNGTECDITMYELOBFUW7CR36644JZMFYZA3UBHQW",
                "type": 1
                },
                {
                "code": "EUR:GB37DH4CM64RFUJ4LVNGTECDITMYELOBFUW7CR36644JZMFYZA3UBHQW",
                "type": 1
                }
            ],
            "baseAsset": {
                "code": "XLM",
                "type": 1
            },
            "decimals": 14,
            "fee": 1000000,
            "network": "pubnet",
            "oracleId": "CDECMVN2DMV6AIYBWABZZWKT2CW5GJG3GBZIVBPSYXPCRZNKVZKNREJF",
            "period": 86400000,
            "timeframe": 300000
            }
        ],
        "minDate": 17000000000,
        "nodes": [
            {
            "pubkey": "GB5DYOR2IMDERGOB6C67I2ENSFJXCZ2OZACDF2MRUWAPX2NCKSSZC5G5",
            "url": "ws://127.0.0.1"
            },
            {
            "pubkey": "GAKQQSOK7AOSWKYZ3576AIVF4QIT5WDGOUTHYQ33BPMUACWJI4FFN5MT",
            "url": "ws://127.0.0.2"
            }
        ],
        "wasmHash": "551723e0178208dd25c950bf78ab5618d47257a594654bbcaaf6cec8dc8c240c"
    },
    "timestamp": 18000000000,
    "description": "Some description here",
    "expirationDate": 1703676815036,
    "nonce": 1701285776674,
    "signatures": [
        {
            "nonce": 1701285776671,
            "pubkey": "GB5DYOR2IMDERGOB6C67I2ENSFJXCZ2OZACDF2MRUWAPX2NCKSSZC5G5",
            "signature": "7f73e95e52086a6885299575488a041672d65dbc880fe72c5a7903a7e89a413867deff467ed7ccb21d80e6b5ccd859d55cc0ecd43e56b6d5736cc26ecb613704"
        }
    ]
}

function configFormatter(config) {
    if (!config)
        return
    const contracts = {}
    config.contracts?.forEach(contract => contracts[contract.admin] = contract)
    return {...config, contracts}
}

export default function DashboardPage() {
    const [settings, setSettings] = useState()
    const [pendingSettings, setPendingSettings] = useState()

    useEffect(() => {

        getCurrentConfig()
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                console.log(res)
                setSettings({...testConfig, ...res.currentCon, config: configFormatter(testConfig.config)})
                setPendingSettings({...res.pendingConfig})
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to update data'}))
    }, [])

    if (!settings)
        return <div className="loader"/>

    return <div>
        <div className="row">
            <div className="column column-25">
                <div className="segment" style={{minHeight: '50vh'}}>
                    <UpdateNodeNavigationView config={settings.config}/>
                    {/* <ConfigChangesView settings={settings}/> */}
                </div>
                <div className="space mobile-only"/>
            </div>
            <div className="column column-75">
                <div className="flex-column h-100">
                    <UpdateRequestVotingView pendingSettings={pendingSettings}/>
                    <SettingsSection settings={settings}/>
                </div>
            </div>
        </div>
        <div className="space">
            {/* <NodeStatisticsView/> */}
        </div>
    </div>
}