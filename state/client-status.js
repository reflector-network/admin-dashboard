import {makeAutoObservable} from 'mobx'
import {navigation} from '@stellar-expert/navigation'
import {checkAlbedoSession} from '../providers/albedo-provider'
import nodeStatus from './node-status'

class ClientStatus {
    constructor() {
        this.pubkey = localStorage.getItem('pubkey') || ''
        this.apiOrigin = localStorage.getItem('apiOrigin') || ''
        makeAutoObservable(this)
        scheduleSessionPolling()
    }

    /**
     * Authorized public key
     * @type {String}
     * @readonly
     */
    pubkey = ''

    /**
     * Reflector node HTTP API origin URL
     * @type {String}
     */
    apiOrigin = ''

    /**
     * Whether Albedo session has been initialized
     * @type {Boolean}
     * @readonly
     */
    hasSession = false

    /**
     * Whether a user-provided pubkey matches server pubkey
     * @return {Boolean}
     */
    get isMatchingKey() {
        return !nodeStatus.pubkey || this.pubkey === nodeStatus.pubkey
    }

    setNodePubkey(key = '') {
        this.pubkey = key
        setGlobalConfigParam('nodePubkey', key)
        this.pollSession()
        if (this.hasSession && key && nodeStatus.pubkey && nodeStatus.pubkey !== key) {
            notify({type: 'warning', message: 'Unauthorized. Please authorize session for public key ' + nodeStatus.pubkey})
        }
    }

    setApiOrigin(origin = '') {
        this.apiOrigin = origin
        setGlobalConfigParam('apiOrigin', origin)
        if (!origin) {
            navigation.navigate('/connect')
        }
    }

    pollSession() {
        this.hasSession = checkAlbedoSession()
    }
}

const clientStatus = new ClientStatus()

function scheduleSessionPolling() {
    setTimeout(function () {
        clientStatus.pollSession()
        scheduleSessionPolling()
    }, 10_000)
}

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