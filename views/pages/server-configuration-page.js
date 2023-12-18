import React, {useCallback, useEffect, useState} from 'react'
import {Button} from '@stellar-expert/ui-framework'
import {getCurrentConfig, postApi} from '../../api/interface'
import clientStatus from '../../state/client-status'
import invocationFormatter from '../util/invocation-formatter'

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

export default function ServerConfigurationPage() {
    const [configuration, setConfiguration] = useState({})
    const [configProperties, setConfigProperties] = useState()
    const [inProgress, setInProgress] = useState(false)
    const [isValid, setIsValid] = useState(false)

    useEffect(() => {
        getCurrentConfig()
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                setConfigProperties(invocationFormatter(res.currentConfig.config || {}, 1))
                setConfiguration(res.currentConfig.config)
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to get configuration'}))
    }, [])

    const changeConfig = useCallback(e => {
        const val = e.target.value
        setConfigProperties(val)
        try {
            const pureConfig = JSON.parse(val.replaceAll("'",'"'))
            setConfiguration(pureConfig)
            setIsValid(true)
        } catch (e) {
            console.error(e)
            setIsValid(false)
        }
    }, [])

    const submitUpdates = useCallback(async () => {
        setInProgress(true)
        const signature = await clientStatus.createSignature(configuration.config)

        const {id, initiator, status, ...otherProperties} = configuration
        postApi('config', {
            ...otherProperties,
            signatures: [signature]
        })
            .then(res => {
                if (res.error)
                    throw new Error(res.error)
                notify({type: 'success', message: 'Update submited'})
            })
            .catch(error => notify({type: 'error', message: error?.message || 'Failed to update data'}))
            .finally(() => setInProgress(false))
    }, [configuration])

    return <div className="segment blank">
        <h3>Quorum configuration file</h3>
        <hr className="flare"/>
        <div className="space">
            <textarea className="result" style={{height: '75vh'}}
                      value={configProperties} onChange={changeConfig}/>
        </div>
        <div className="space row">
            <div className="column column-75 text-center">
                {!!inProgress && <>
                    <div className="loader inline"/>
                    <span className="dimmed text-small"> In progress...</span>
                </>}
            </div>
            <div className="column column-25">
                <Button block disabled={!isValid || inProgress} onClick={submitUpdates}>Submit</Button>
            </div>
        </div>
    </div>
}