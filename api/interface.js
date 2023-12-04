import {signData} from '../providers/albedo-provider'
import clientStatus from '../state/client-status'
import objectKeySorter from './../views/util/object-key-sorter'

const tunnelServer = 'https://tunnel.reflector.world/'

async function getApi(endpoint) {
    return await fetchApi(endpoint, {})
}

async function getNoAuthApi(endpoint) {
    return await fetchApi('')
}

export async function postApi(action, data) {
    const nonce = generateNonce()
    const payload = objectKeySorter({...data, nonce})
    console.log(payload)
    const signature = await signData(payload)
    const authorizationHeader = `${clientStatus.clientPublicKey}.${signature}.${nonce}`
    return await fetchApi(action, {
        method: 'POST',
        authorizationHeader,
        body: JSON.stringify(payload)
    })
}

export function getCurrentConfig() {
    return getApi('config')
}

export function getStatistics() {
    return getApi('statistics')
}

export function getConfigRequirements() {
    return getNoAuthApi('config-requirements')
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