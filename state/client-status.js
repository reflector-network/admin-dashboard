import {makeAutoObservable} from 'mobx'
import {checkAlbedoSession, signData} from '../providers/albedo-provider'
import sortObjectKeys from '../views/util/object-key-sorter'

class ClientStatus {
    constructor() {
        makeAutoObservable(this)
        setInterval(() => this.pollSession(), 10_000)
    }

    /**
     * Authorized public key
     * @type {String}
     * @readonly
     */
    clientPublicKey = ''

    /**
     * Whether Albedo session has been initialized
     * @type {Boolean}
     * @readonly
     */
    hasSession = false

    serverPublicKey = ''

    serverVersion = ''

    statistics

    /**
     * Whether a user-provided pubkey matches server pubkey
     * @return {Boolean}
     */
    get isMatchingKey() {
        return !this.serverPublicKey || this.clientPublicKey === this.serverPublicKey
    }

    setNodePubkey(key = '') {
        this.clientPublicKey = key
        this.pollSession()
        if (this.hasSession && key && this.serverPublicKey && this.serverPublicKey !== key) {
            notify({type: 'warning', message: 'Unauthorized. Please authorize session for public key ' + this.serverPublicKey})
        }
    }

    pollSession() {
        this.hasSession = checkAlbedoSession()
    }

    async createSignature(data, rejected) {
        const nonce = new Date().getTime()
        const payload = {...data, nonce}
        if (rejected)
            payload.rejected = true
        const signature = await signData(sortObjectKeys(payload))
        return {
            signature,
            pubkey: this.clientPublicKey,
            nonce,
            rejected
        }
    }
}

export default new ClientStatus()