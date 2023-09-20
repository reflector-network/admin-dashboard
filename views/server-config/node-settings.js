import {makeAutoObservable, runInAction} from 'mobx'
import {getCurrentSettings} from '../../api/interface'

export const UPDATE_NODES = 'nodes'
export const UPDATE_ASSETS = 'assets'
export const UPDATE_PERIOD = 'period'

export default class NodeSettings {
    constructor() {
        this.data = {}
        this.loadedData = {}
        this.updateData = null
        this.updatedAssets = []
        this.updatedNode = null
        this.action = ''
        this.timeframe = 0
        this.isValid = false
        this.isLimitUpdates = false
        this.isFinalized = false

        makeAutoObservable(this)
    }

    fetchSettings() {
        getCurrentSettings()
            .then(loadedData => this.finalizeSettings(loadedData))
            .catch(({error}) => notify({type: 'error', message: error?.message || "Failed to get data"}))
    }

    finalizeSettings(loadedData) {
        runInAction(() => {
            this.loadedData = loadedData
            this.isLimitUpdates = false
            this.timeframe = loadedData.timeframe
        })
    }

    prepareData() {
        this.data.timestamp = (Math.floor(this.data.timestamp / this.timeframe) * this.timeframe) + (this.timeframe / 2)
        const {assets, ...otherSettings} = this.data
        this.updateData = otherSettings
        this.isFinalized = false
        this.updateData.nonce = Date.now()
        switch (this.action) {
            case UPDATE_ASSETS:
                this.updateData.assets = this.updatedAssets
                break
        }
    }

    validate() {
        if (!this.validateTimestamp())
            return this.isValid = false

        switch (this.action) {
            case UPDATE_NODES:
                this.isValid = !!this.data.nodes
                break
            case UPDATE_ASSETS:
                this.isValid = !!this.updatedAssets.length
                break
            case UPDATE_PERIOD:
                this.isValid = this.data.period > this.timeframe
                break
            default:
                this.isValid = false
        }
    }

    validateTimestamp() {
        let valid = true
        const min = new Date().getTime() + 30 * 60 * 1000
        const max = new Date().getTime() + 10 * 24 * 60 * 60 * 1000
        if (!this.data.timestamp && typeof this.data.timestamp !== 'number')
            valid = false
        if (this.data.timestamp < min || this.data.timestamp > max)
            valid = false
        return valid
    }
}