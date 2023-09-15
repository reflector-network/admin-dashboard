import {makeAutoObservable, runInAction} from 'mobx'
import {navigation} from '@stellar-expert/navigation'
import {checkAlbedoSession} from '../providers/albedo-provider'
import {getReflectorNodeInfo, getStatistics} from '../api/interface'
import updateRequest from './config-update-request'

const statsRefreshInterval = 30//30 seconds

class ClientStatus {
    constructor() {
        this.clientPublicKey = localStorage.getItem('pubkey') || ''
        this.apiOrigin = localStorage.getItem('apiOrigin') || ''
        makeAutoObservable(this)
        setInterval(() => this.pollSession(), 10_000)
        setInterval(() => this.updateNodeInfo(), statsRefreshInterval * 1000)
        setInterval(() => this.updateStatistics(), statsRefreshInterval * 1000)
        if (this.apiOrigin) {
            setTimeout(() => this.updateNodeInfo(), 1000)
        }
    }

    /**
     * Authorized public key
     * @type {String}
     * @readonly
     */
    clientPublicKey = ''

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

    serverPublicKey = ''

    serverVersion = ''

    statistics

    /**
     * @type {'unknown'|'init'|'ready'}
     */
    status = 'unknown'

    /**
     * Whether a user-provided pubkey matches server pubkey
     * @return {Boolean}
     */
    get isMatchingKey() {
        return !this.serverPublicKey || this.clientPublicKey === this.serverPublicKey
    }

    setNodePubkey(key = '') {
        this.clientPublicKey = key
        setGlobalConfigParam('nodePubkey', key)
        this.pollSession()
        if (this.hasSession && key && this.serverPublicKey && this.serverPublicKey !== key) {
            notify({type: 'warning', message: 'Unauthorized. Please authorize session for public key ' + this.serverPublicKey})
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

    updateStatistics() {
        if (!checkAlbedoSession())
            return
        getStatistics()
            .then(statistics => {
                if (statistics.error)
                    throw new Error(statistics.error)
                runInAction(() => {
                    this.statistics = statistics
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

    updateNodeInfo() {
        if (!this.apiOrigin) {
            this.status = 'unknown'
            return
        }
        getReflectorNodeInfo()
            .then(({name, pubkey, status, nodeStatus, version}) => {
                runInAction(() => {
                    if (name !== 'reflector') {
                        this.status = 'unknown'
                        this.serverPublicKey = ''
                        this.serverVersion = ''
                        return
                    }
                    this.status = status || nodeStatus
                    this.serverVersion = version
                    this.serverPublicKey = pubkey || ''
                    if (this.status === 'init') {
                        if (updateRequest.hasUpdate) {
                            navigation.navigate('/config')
                        } else {
                            navigation.navigate('/initialization-progress')
                        }
                    }
                })
            })
            .catch(({error}) => notify({type: 'error', message: error?.message || 'Node API is unreachable'}))
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