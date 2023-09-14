import {signData} from '../providers/albedo-provider'
import clientStatus from '../state/client-status'

function proxy(originalUrl) {
    return 'https://tunnel.reflector.world/?tunnel=' + encodeURIComponent(originalUrl)
}

async function getApi(endpoint, data) {
    if (!data) {
        data = {nonce: generateNonce()}
    }
    const payload = new URLSearchParams(data).toString()
    const res = await fetch(proxy(clientStatus.apiOrigin + endpoint + `?${payload}`), {
        method: 'GET',
        headers: await generateAuthHeaders(payload)
    })
    return res.json()
}

async function getNoAuthApi(endpoint, apiUrl) {
    const res = await fetch(proxy((apiUrl || clientStatus.apiOrigin) + endpoint), {method: 'GET'})
    return res.json()
}

export async function postApi(action, data) {
    const payload = {...data, nonce: generateNonce()}
    const res = await fetch(proxy(clientStatus.apiOrigin + action), {
        method: 'POST',
        headers: await generateAuthHeaders(payload),
        body: JSON.stringify(payload)
    })
    return res.json()
}

export function getCurrentSettings() {
    return getApi('contract-settings')
}

export function getStatistics() {
    return getApi('statistics')
}

export function getConfig() {
    return getApi('config')
}

export function getConfigRequirements() {
    return getNoAuthApi('config-requirements')
}

export function getReflectorNodeInfo(nodeApiUrl) {
    return getNoAuthApi('', nodeApiUrl)
}

function generateAuthHeaders(data) {
    return signData(data).then(message_signature => ({
        'Content-Type': 'application/json',
        Authorization: 'Signature ' + message_signature
    }))
}

function generateNonce() {
    return new Date().getTime()
}