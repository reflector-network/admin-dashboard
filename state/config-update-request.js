import {makeAutoObservable} from 'mobx'
import {navigation, parseQuery, stringifyQuery} from '@stellar-expert/navigation'

class ConfigUpdateRequest {
    constructor() {
        makeAutoObservable(this)
        this.parseFromUrl()
    }

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
            console.log(update)
            this.externalRequest = JSON.parse(update)
            navigation.updateQuery({update: undefined})
        } catch (err) {
            notify({type: 'error', message: 'Invalid settings modification request'})
        }
    }
}

const updateRequest = new ConfigUpdateRequest()

export default updateRequest