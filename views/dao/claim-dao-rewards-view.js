import React, {useCallback, useEffect, useState} from 'react'
import {StrKey, TransactionBuilder} from '@stellar/stellar-sdk'
import {Amount, Button, InfoTooltip, useStellarNetwork} from '@stellar-expert/ui-framework'
import {fromStroops, toStroops} from '@stellar-expert/formatter'
import DaoClient from '@reflector/dao-client'
import clientStatus from '../../state/client-status'
import {signTx} from '../../providers/albedo-provider'
import ConfigLayout from '../server-config/config-layout'

const xrf = 'XRF-GCHI6I3X62ND5XUMWINNNKXS2HPYZWKFQBZZYBSMHJ4MIP2XJXSZTXRF'

export default function ClaimDaoRewardsView() {
    const [available, setAvailable] = useState(undefined)
    const [amount, setAmount] = useState('0')
    const [destination, setDestination] = useState('')
    const network = useStellarNetwork()

    const updateAvailableAmount = useCallback(() => {
        setAvailable(undefined)
        createdDaoClient(network)
            .available(clientStatus.clientPublicKey)
            .then(available => {
                setAvailable(available)
                setAmount(fromStroops(available))
            })
    }, [network])

    useEffect(() => updateAvailableAmount(), [clientStatus.clientPublicKey, network])

    const updateAmount = useCallback(e => {
        setAmount(e.target.value.replace(/[^\d.]/g, ''))
    }, [setAmount])

    const updateDestination = useCallback(e => {
        setDestination(e.target.value.replace(/[^A-Z0-9]/g, ''))
    }, [setDestination])

    const claim = useCallback(() => {
        if (!(amount > 0))
            return
        if (destination && !(StrKey.isValidEd25519PublicKey(destination) || StrKey.isValidContract(destination)))
            return alert('Invalid recipient address')
        const daoClient = createdDaoClient(network, true)
        daoClient.claim(clientStatus.clientPublicKey, destination, toStroops(amount))
            .then(() => {
                updateAvailableAmount()
                notify({
                    type: 'success',
                    message: `${amount} XRF claimed`
                })
            })
            .catch(e => {
                console.error(e)
                updateAvailableAmount()
            })
    }, [destination, amount, network])

    return <ConfigLayout title="Claim DAO rewards" description={<ClaimRewardsDescription/>} primaryAction={
        <div className="text-small" style={{paddingTop: '1em'}}>
            <span className="dimmed">Available: </span>
            {available !== undefined ?
                <Amount asset={xrf} amount={available} adjust issuer={false}/> :
                <span className="dimmed text-small">loading...</span>}
        </div>}>
        <div className="row">
            <div className="column column-40">
                <label className="micro-space dimmed">Amount to claim <InfoTooltip>
                    Allocated unlocked funds can be claimed at once or in portions.
                </InfoTooltip></label>
            </div>
            <div className="column column-60">
                <input type="text" className="text-right" placeholder="e.g. 1000" value={amount} onChange={updateAmount}/>
            </div>
            <div className="space column column-90"></div>
            <div className="column column-40">
                <label className="micro-space dimmed">Recipient (optional)<InfoTooltip>
                    Account or contract address that will receive a payout. Live empty to claim directly to your node public key address.
                </InfoTooltip></label>
            </div>
            <div className="column column-60">
                <input type="text" className="text-right" placeholder="account or contract address"
                       value={destination} onChange={updateDestination}/>
            </div>
            <div className="column column-50 column-offset-50 space">
                <Button block onClick={claim}>Claim</Button>
            </div>
        </div>
    </ConfigLayout>
}

function ClaimRewardsDescription() {
    return <div>
        <p>
            The DAO fund smart contract allocates rewards to oracle node operators for the participation in the cluster consensus and to the
            Reflector developers team on a weekly basis. Invocation of the <code>unlock()</code> function on the DAO smart contract
            initiates the process of the XRF tokens unlocking for addresses of oracle nodes that currently participate in the DAO and to
            the Reflector developer organization address, configured in the contract itself. Allocated tokens later can be claimed from
            the fund by operators.
        </p>
        <p>
            Every week DAO members receive 0.12% of the remaining DAO fund balance, distributed evenly between all members.
            Additionally, Reflector developers receive 0.03% of XRF tokens remaining in the DAO fund.
        </p>
    </div>
}

function createdDaoClient(network, autoSubmit = false) {
    return new DaoClient({
        publicKey: clientStatus.clientPublicKey,
        rpcUrl: network === 'testnet' ? 'https://soroban-testnet.stellar.org' : 'https://mainnet.sorobanrpc.com',
        signTransaction: async function (tx, {network, networkPassphrase, accountToSign}) {
            const res = await signTx(tx, accountToSign, networkPassphrase, null, autoSubmit)
            return TransactionBuilder.fromXDR(res.signed_envelope_xdr, networkPassphrase)
        }
    })
}
