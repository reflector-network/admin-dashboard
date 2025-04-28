import {Horizon, Networks, Operation, TransactionBuilder} from '@stellar/stellar-sdk'
import {createdDaoClient} from './dao-client'

const daoChannelAccount = 'GBPMF5VB7OS5J7DHWILIMHJJ7AP6ERRC66VW7BTGTGXD2PJ2XVFQRDAO'

/**
 * @param {bigint} ballotId
 * @param {{}} ballot
 * @return {Promise<{for:string,against:string}>}
 */
export async function generateVotingTransactions(ballotId, ballot) {
    return {
        for: await buildVotingTx(ballotId, ballot, true),
        against: await buildVotingTx(ballotId, ballot, false)
    }
}

async function buildVotingTx(ballotId, ballot, accepted) {
    const client = createdDaoClient('public', daoAdmin)
    const voteTx = await client.vote(ballotId, accepted, true)
    const expires = new Date(Number(ballot.created) * 1000 + 14 * 24 * 60 * 60 * 1000)
    const txSource = await new Horizon.Server('https://horizon.stellar.org/').loadAccount(daoChannelAccount)
    const builder = new TransactionBuilder(txSource, {
        fee: (parseInt(voteTx.built.fee, 10) + 5000000).toString(), //+0.5 XLM
        sorobanData: voteTx.simulationData.transactionData,
        networkPassphrase: Networks.PUBLIC
    })
    const invocation = voteTx.built.operations[0]
    builder.operations[0] = Operation.invokeHostFunction({
        auth: invocation.auth,
        func: invocation.func,
        source: daoAdmin
    })

    const built = builder.setTimebounds(0, expires).build()
    const hash = built.hash().toString('hex')
    console.log('Tx vote ' + accepted + ' ' + hash)
    console.log(built.toXDR())
    //check if already exists
    try {
        await submitTxToRefractor(built)
        return 'https://refractor.space/tx/' + hash
    } catch (err) {
        console.error(err)
        //return parseRefractorXdr(
    }
}

async function submitTxToRefractor(tx) {
    return fetch('https://api.refractor.space/tx/', {
        method: 'POST',
        body: JSON.stringify({
            network: 'public',
            xdr: tx.toXDR(),
            submit: true
        }),
        headers: {'Content-Type': 'application/json'}
    }).then(r => r.json())
}

function parseRefractorXdr(res) {
    const {xdr, network} = res
    if (!xdr)
        throw res
    const parsed = TransactionBuilder.fromXDR(xdr, Networks[network.toUpperCase()])
    return {xdr, parsed}
}