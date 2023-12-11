import {signData} from '../providers/albedo-provider'
import clientStatus from '../state/client-status'
import objectKeySorter from './../views/util/object-key-sorter'

const tunnelServer = 'https://tunnel.reflector.world/'

async function getApi(endpoint, data) {
    const payload = (data) ? '?' + new URLSearchParams(data).toString() : ''
    return await fetchApi(endpoint + payload, {})
}

export async function postApi(action, data) {
    const nonce = generateNonce()
    const payload = objectKeySorter({...data, nonce})
    const signature = await signData(payload)
    const authorizationHeader = `${clientStatus.clientPublicKey}.${signature}.${nonce}`
    return await fetchApi(action, {
        method: 'POST',
        authorizationHeader,
        body: JSON.stringify(data)
    })
}

export function getCurrentConfig() {
    return getApi('config')
}

export function getConfigHistory(params) {
    return getApi('config/history', params)
}

export function getStatistics() {
    return getApi('statistics')
}

async function fetchApi(relativeUrl, {method = 'GET', authorizationHeader = null, body = undefined}) {
    const tunnelRequired = !(apiOrigin.startsWith('https://') || apiOrigin.startsWith('http://localhost') || apiOrigin.startsWith('http://127.0.0.1'))
    const url = (tunnelRequired ? tunnelServer : apiOrigin) + relativeUrl
    const headers = {'Content-Type': 'application/json'}
    if (authorizationHeader) {
        headers.Authorization = authorizationHeader
    }
    if (tunnelRequired) {
        headers['X-TUNNEL'] = apiOrigin
    }
    const res = await fetch(url, {
        method,
        headers,
        body
    })
    return res.json()
}

function generateNonce() {
    return new Date().getTime()
}