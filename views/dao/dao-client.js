import DaoClient from '@reflector/dao-client'
import clientStatus from '../../state/client-status'
import {signTx} from '../../providers/albedo-provider'

const contractId = daoContractId

/**
 * @param {string} network
 * @param {string} [publicKey]
 * @return {DaoClient}
 */
export function createdDaoClient(network, publicKey) {
    return new DaoClient({
        contractId,
        publicKey: publicKey || clientStatus.clientPublicKey,
        rpcUrl: network === 'testnet' ? 'https://soroban-testnet.stellar.org' : 'https://mainnet.sorobanrpc.com',
        signTransaction: async function (tx, {network, networkPassphrase, accountToSign}) {
            const res = await signTx(tx, accountToSign, networkPassphrase)
            return {
                signedTxXdr: res.signed_envelope_xdr,
                signerAddress: res.pubkey
            }
        }
    })
}