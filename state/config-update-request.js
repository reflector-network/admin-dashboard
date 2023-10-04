import {makeAutoObservable} from 'mobx'
import {navigation, parseQuery} from '@stellar-expert/navigation'

class ConfigUpdateRequest {
    constructor() {
        makeAutoObservable(this)
        this.parseFromUrl()
    }

    isConfirmed = false

    externalRequest

    get hasUpdate() {
        return !!this.externalRequest
    }

    /**
     * @private
     */
    parseFromUrl() {
        try {
            const {update} = parseQuery()
            if (!update)
                return
            this.externalRequest = JSON.parse(update)
            navigation.updateQuery({update: undefined})
        } catch (err) {
            notify({type: 'error', message: 'Invalid settings modification request'})
        }
    }

    confirmRequest() {
        this.isConfirmed = true
    }
}

const updateRequest = new ConfigUpdateRequest()

export default updateRequest