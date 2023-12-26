import {makeAutoObservable, runInAction} from 'mobx'
import {checkAlbedoSession, signData} from '../providers/albedo-provider'
import {getStatistics} from '../api/interface'
import objectKeySorter from '../views/util/object-key-sorter'

const statsRefreshInterval = 30//30 seconds

class ClientStatus {
    constructor() {
        this.clientPublicKey = localStorage.getItem('pubkey') || ''
        makeAutoObservable(this)
        setInterval(() => this.pollSession(), 10_000)
        setInterval(() => this.updateStatistics(), statsRefreshInterval * 1000)
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

    updateStatistics() {
        if (!checkAlbedoSession())
            return
        getStatistics()
            .then(statistics => {
                if (statistics.error)
                    throw new Error(statistics.error)
                runInAction(() => {
                    this.statistics = statistics?.at(-1)
                })
            })
            .catch((error) => {
                notify({
                    type: 'error',
                    message: 'Failed to retrieve statistics. ' + (error?.message || '')
                })
                runInAction(() => {
                    this.statistics = null
                })
            })
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