import {signData} from '../providers/albedo-provider'
import clientStatus from '../state/client-status'
import sortObjectKeys from './../views/util/object-key-sorter'
import {shortenString} from '@stellar-expert/formatter'
import {buildRouteBinding} from './route-binding.mjs'
import {readApiResponse} from './api-response.mjs'

const nodesMapping = new Map()

export function getNodePublicKeys() {
    return getApi('nodes')
}

export function getCurrentConfig() {
    return getApi('config')
        .then(res => {
            const {nodes} = res.currentConfig.config.config
            for (const [key, props] of Object.entries(nodes)) {
                nodesMapping.set(key, props)
            }
            return res
        })
}

export function getConfigHistory(params) {
    return getApi('config/history', params)
}

export function getServerLogs(node) {
    return getApi('logs', withNodeParam(node))
}

export function getLogFile(filename, node) {
    return getApi('logs/' + filename, withNodeParam(node))
}

export function getStatistics() {
    return getApi('statistics', {}, true)
}

export function getNotificationSettings() {
    return getApi('settings/node')
}

export function getGatewaysInfo() {
    return getApi('gateways')
}

export function updateGatewaysInfo({challenge, urls}) {
    return postApi('gateways', {challenge, urls})
}

export function getMetrics() {
    return getApi('metrics', {})
}

export async function getTx(hash) {
    const res = await fetch('https://horizon.stellar.org/transactions/' + hash, {
        method: 'GET'
    })
    return res.json()
}

/**
 * Return org domain for a given node pubkey
 * @param {string} key
 * @return {string}
 */
export function resolveNodeName(key) {
    return nodesMapping.get(key)?.domain || shortenString(key, 12)
}

/**
 * Return current cluster nodes list
 * @return {string[]}
 */
export function getNodeKeys() {
    return Array.from(nodesMapping.keys())
}

export async function postApi(action, data) {
    const nonce = generateNonce()
    //the signature covers the route and its query as well; without it every POST is refused
    const payload = sortObjectKeys({...data, nonce, path: buildRouteBinding(action, nonce)})

    const authorizationHeader = clientStatus.hasSession ? await generateAuthHeader(payload, nonce) : null
    return await fetchApi(action, {
        method: 'POST',
        authorizationHeader,
        body: JSON.stringify(data)
    })
}

async function getApi(endpoint, data = {}, anonymous = false) {
    const getRelativeUrl = (params) => endpoint + (params.size > 0 ? '?' + params.toString() : '')
    const relativeUrl = getRelativeUrl(new URLSearchParams(data))
    let authorizationHeader = null
    if (!anonymous) {
        const nonce = generateNonce()
        const payloadData = getRelativeUrl(new URLSearchParams(sortObjectKeys({...data, nonce})))
        authorizationHeader = clientStatus.hasSession ? await generateAuthHeader(payloadData, nonce) : null
    }
    return await fetchApi(relativeUrl, {authorizationHeader})
}

/**
 * @param {{}} payload - payload to sign with nonce
 * @param {number} nonce - nonce to include in header
 * @returns {Promise<string>}
 */
async function generateAuthHeader(payload, nonce) {
    const signature = await signData(payload)
    return `${clientStatus.clientPublicKey}.${signature}.${nonce}`
}

async function fetchApi(relativeUrl, {method = 'GET', authorizationHeader = null, body = undefined}) {
    const url = orchestratorApiOrigin + relativeUrl
    const headers = {'Content-Type': 'application/json'}
    if (authorizationHeader) {
        headers.Authorization = authorizationHeader
    }
    const res = await fetch(url, {
        method,
        headers,
        body
    })
    return await readApiResponse(res)
}

function generateNonce() {
    return new Date().getTime()
}

function withNodeParam(node) {
    const params = {}
    if (node) {
        params.node = node
    }
    return params
}
