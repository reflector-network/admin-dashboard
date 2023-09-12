import {navigation} from '@stellar-expert/navigation'

export default function parseExternalUpdateRequest() {
    const url = new URL(window.location)
    let updateParams = {}
    try {
        updateParams = JSON.parse(url.searchParams.get('update'))
    } catch (err) {
        notify({type: 'error', message: "Invalid update data"})
        navigation.navigate('/')
    }
    return updateParams
}