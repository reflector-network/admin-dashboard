import {signData} from '../providers/albedo-provider'
import clientStatus from '../state/client-status'
import objectKeySorter from './../views/util/object-key-sorter'

/**
 *
 * @param {any} payload - payload to sign with nonce
 * @param {number} nonce - nonce to include in header
 * @returns {Promise<string>}
 */
async function tryGetAuthHeader(payload, nonce) {
    const signature = await signData(payload)
    return `${clientStatus.clientPublicKey}.${signature}.${nonce}`
}

async function getApi(endpoint, data = {}, anonymous = false) {
    const getRelativeUrl = (params) => endpoint + (params.size > 0 ? '?' + params.toString() : '')
    const relativeUrl = getRelativeUrl(new URLSearchParams(data))
    let authorizationHeader = null
    if (!anonymous) {
        const nonce = generateNonce()
        const payloadData = getRelativeUrl(new URLSearchParams(objectKeySorter({...data, nonce})))
        authorizationHeader = clientStatus.hasSession ? await tryGetAuthHeader(payloadData, nonce) : null
    }
    return await fetchApi(relativeUrl, {authorizationHeader})
}

export async function postApi(action, data) {
    const nonce = generateNonce()
    const payload = objectKeySorter({...data, nonce})

    const authorizationHeader = clientStatus.hasSession ? await tryGetAuthHeader(payload, nonce) : null
    return await fetchApi(action, {
        method: 'POST',
        authorizationHeader,
        body: JSON.stringify(data)
    })
}

export function getNodePublicKeys() {
    return getApi('nodes')
}

export function getCurrentConfig() {
    return getApi('config')
}

export function getConfigHistory(params) {
    return getApi('config/history', params)
}

export function getServerLogs() {
    return getApi('logs')
}

export function getLogFile(filename) {
    return getApi('logs/' + filename)
}

export function getStatistics() {
    return getApi('statistics', {}, true)
}

export function getNotificationSettings() {
    return getApi('settings/node')
}

export async function getTx(hash) {
    const res = await fetch('https://horizon.stellar.org/transactions/' + hash, {
        method: 'GET'
    })
    return res.json()
}

async function fetchApi(relativeUrl, {method = 'GET', authorizationHeader = null, body = undefined}) {
    const url = apiOrigin + relativeUrl
    const headers = {'Content-Type': 'application/json'}
    if (authorizationHeader) {
        headers.Authorization = authorizationHeader
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