import {makeAutoObservable, runInAction} from 'mobx'
import {navigation} from '@stellar-expert/navigation'
import {checkAlbedoSession} from '../providers/albedo-provider'
import {getReflectorNodeInfo, getStatistics} from '../api/interface'

const refreshInterval = 15 //15 seconds

class NodeStatus {
    constructor() {
        makeAutoObservable(this)
        setInterval(() => this.updateNodeInfo(), refreshInterval * 1000)
        setInterval(() => this.updateStatistics(), refreshInterval * 1000)
    }

    pubkey = ''

    version = ''

    statistics

    /**
     * @type {'unknown'|'init'|'ready'}
     */
    status = 'unknown'

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
        getReflectorNodeInfo()
            .then(({name, pubkey, nodeStatus, version}) => {
                runInAction(() => {
                    if (name !== 'reflector') {
                        this.status = 'unknown'
                        this.pubkey = ''
                        this.version = ''
                        return
                    }
                    this.status = nodeStatus
                    this.version = version
                    this.pubkey = pubkey || ''
                    if (nodeStatus === 'init') {
                        navigation.navigate('/initialization-progress')
                    }
                })
            })
            .catch(({error}) => notify({type: 'error', message: error?.message || 'Invalid API url'}))
    }
}

const nodeStatus = new NodeStatus()

export default nodeStatus