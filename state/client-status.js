import {makeAutoObservable} from 'mobx'
import {checkAlbedoSession, signData} from '../providers/albedo-provider'
import objectKeySorter from '../views/util/object-key-sorter'

class ClientStatus {
    constructor() {
        makeAutoObservable(this)
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
    get hasSession() {
        return checkAlbedoSession()
    }

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
        if (this.hasSession && key && this.serverPublicKey && this.serverPublicKey !== key) {
            notify({type: 'warning', message: 'Unauthorized. Please authorize session for public key ' + this.serverPublicKey})
        }
    }

    async createSignature(data, rejected) {
        const nonce = new Date().getTime()
        const payload = {...data, nonce}
        if (rejected)
            payload.rejected = true
        const signature = await signData(objectKeySorter(payload))
        return {
            signature,
            pubkey: this.clientPublicKey,
            nonce,
            rejected
        }
    }
}

const clientStatus = new ClientStatus()


/**
 * Update global configuration parameter in localStorage
 * @param {String} key
 * @param {String|undefined} value
 */
function setGlobalConfigParam(key, value) {
    if (value === undefined) {
        localStorage.removeItem(key)
    } else {
        localStorage.setItem(key, value)
    }
}

export default clientStatus