import {checkAlbedoSession, signData} from '../providers/albedo-provider'
import sortObjectKeys from '../views/util/object-key-sorter'

class ClientStatus {
    constructor() {
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
     * Subscribed change listeners
     * @type {Set<function>}
     * @private
     */
    listeners = new Set()

    /**
     * Whether a user-provided pubkey matches server pubkey
     * @return {Boolean}
     */
    get isMatchingKey() {
        return !this.serverPublicKey || this.clientPublicKey === this.serverPublicKey
    }

    /**
     * Subscribe to client status changes
     * @param {function} listener - Callback invoked on every state change
     * @return {function} Unsubscribe callback
     */
    subscribe(listener) {
        this.listeners.add(listener)
        return () => this.listeners.delete(listener)
    }

    setNodePubkey(key = '') {
        this.clientPublicKey = key
        this.pollSession()
        if (this.hasSession && key && this.serverPublicKey && this.serverPublicKey !== key) {
            notify({type: 'warning', message: 'Unauthorized. Please authorize session for public key ' + this.serverPublicKey})
        }
        this.emitChange()
    }

    /**
     * Update Albedo session availability flag
     * @param {Boolean} value
     */
    setHasSession(value) {
        if (this.hasSession === value)
            return
        this.hasSession = value
        this.emitChange()
    }

    pollSession() {
        const hasSession = checkAlbedoSession()
        if (hasSession === this.hasSession)
            return
        this.hasSession = hasSession
        this.emitChange()
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

    /**
     * Notify all subscribers about a state change
     * @private
     */
    emitChange() {
        for (const listener of this.listeners) {
            listener()
        }
    }
}

export default new ClientStatus()
