import React, {useEffect, useState} from 'react'
import {setStellarNetwork} from '@stellar-expert/ui-framework'
import {getCurrentConfig} from '../../api/interface'
import SettingsSection from '../components/settings-view'
import NodeStatisticsView from '../components/node-statistics-view'
import UpdateNodeNavigationView from '../components/update-node-navigation-view'
import UpdateRequestVotingView from '../components/update-request-voting-view'

const test = {
    "config": {
        "config": {
            "systemAccount": "GCEBYD3K3IYSYLK5EQEK72RVAH2AHZUYSFFG4IOXUS5AOINLMXJRMDRA",
            "contracts": {
                "CBMZO5MRIBFL457FBK5FEWZ4QJTYL3XWID7QW7SWDSDOQI5H4JN7XPZU": {
                    "admin": "GD6CN3XGN3ZGND3RSPMAOB3YCO4HXF2TD6W4OMOUL4YOPC7XGBHXPF5K",
                    "oracleId": "CBMZO5MRIBFL457FBK5FEWZ4QJTYL3XWID7QW7SWDSDOQI5H4JN7XPZU",
                    "baseAsset": {
                        "type": 1,
                        "code": "USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
                    },
                    "decimals": 14,
                    "assets": [
                        {
                            "type": 1,
                            "code": "BTCLN:GDPKQ2TSNJOFSEE7XSUXPWRP27H6GFGLWD7JCHNEYYWQVGFA543EVBVT"
                        },
                        {
                            "type": 1,
                            "code": "AQUA:GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA"
                        }
                    ],
                    "timeframe": 300000,
                    "period": 86400000,
                    "fee": 10000000,
                    "dataSource": "pubnet"
                },
                "CAA2NN3TSWQFI6TZVLYM7B46RXBINZFRXZFP44BM2H6OHOPRXD5OASUW": {
                    "admin": "GDCOZYKHZXOJANHK3ASICJYEFGYUBSEP3YQKEXXLAGV3BBPLOFLGBAZX",
                    "oracleId": "CAA2NN3TSWQFI6TZVLYM7B46RXBINZFRXZFP44BM2H6OHOPRXD5OASUW",
                    "baseAsset": {
                        "type": 2,
                        "code": "USD"
                    },
                    "decimals": 14,
                    "assets": [
                        {
                            "type": 2,
                            "code": "BTC"
                        },
                        {
                            "type": 2,
                            "code": "ETH"
                        },
                        {
                            "type": 2,
                            "code": "USDT"
                        }
                    ],
                    "timeframe": 300000,
                    "period": 86400000,
                    "fee": 10000000,
                    "dataSource": "coinmarketcap"
                }
            },
            "wasmHash": "551723e0178208dd25c950bf78ab5618d47257a594654bbcaaf6cec8dc8c240c",
            "network": "testnet",
            "minDate": 0,
            "nodes": {
                "GCR6ZOFMKDWX5OMUDQZHQWD2FEE4WCWQJOBMRZRQM5BVTPKJ7LL35TBF": {
                    "pubkey": "GCR6ZOFMKDWX5OMUDQZHQWD2FEE4WCWQJOBMRZRQM5BVTPKJ7LL35TBF",
                    "url": "ws://127.0.0.1"
                },
                "GDQFOLVYRNYBTQ2WCXOANDAAM4BSZMLJUEI6CO2PMOCOVDS6SKM2AMRQ": {
                    "pubkey": "GDQFOLVYRNYBTQ2WCXOANDAAM4BSZMLJUEI6CO2PMOCOVDS6SKM2AMRQ",
                    "url": "ws://127.0.0.2"
                }
            }
        },
        "expirationDate": 1703676815036,
        "id": '6569f24395e716d395938261',
        "initiator": 'GB5DYOR2IMDERGOB6C67I2ENSFJXCZ2OZACDF2MRUWAPX2NCKSSZC5G5',
        "description": null,
        "signatures": [
            {
                "nonce": 1701442115266,
                "pubkey": 'GB5DYOR2IMDERGOB6C67I2ENSFJXCZ2OZACDF2MRUWAPX2NCKSSZC5G5',
                "signature": '7cb379c1dcf0edfbee57bdb06f89a9ce98db466102ba40bce3d696bf7717b6bb9e6f56250fe4095db31c3d5d8ce7cf77e5cc52db670f9feeb185eb21cf3e0c04'
            },
            {
                "nonce": 1701694002354,
                "pubkey": 'GAKQQSOK7AOSWKYZ3576AIVF4QIT5WDGOUTHYQ33BPMUACWJI4FFN5MT',
                "signature": '73fd4c5ead39b5e0e975485017c36b62ccee8de91b64f131e72c7d2067db2d063e40c18a1e0065bf82fa84322a388a6df6f6ad94070b851b91d6c99016575703'
            }
        ],
        "status": 'applied',
        "timestamp": 1704700000000
    },
    "hash": 'a371609d90fa52c12ff55ec24e03c3212512a203d6eed504a2e5f470be21c05b'
}

export default function DashboardPage() {
    const [configuration, setConfiguration] = useState()

    useEffect(() => {
        getCurrentConfig()
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                setConfiguration({...res, currentConfig: test})
                //set global network
                setStellarNetwork(test?.config?.config?.network)
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to get configuration'}))
    }, [])

    if (!configuration)
        return <div className="loader"/>

    return <div>
        <div className="row">
            <div className="column column-25">
                <div className="segment" style={{minHeight: '50vh'}}>
                    <UpdateNodeNavigationView contracts={configuration.currentConfig.config.config.contracts}/>
                </div>
                <div className="space mobile-only"/>
            </div>
            <div className="column column-75">
                <div className="flex-column h-100">
                    {!!configuration && <UpdateRequestVotingView pendingSettings={configuration.pendingConfig}/>}
                    <SettingsSection configuration={configuration}/>
                </div>
            </div>
        </div>
        <div className="space">
            {/* <NodeStatisticsView/> */}
        </div>
    </div>
}