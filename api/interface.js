import albedo from '@albedo-link/intent'
import config from './config'

async function getApi(endpoint, data) {
    if (!data) {
        data = {nonce: getNonce()}
    }
    const payload = new URLSearchParams(data).toString()
    const res = await fetch(config.httpApiUrl + endpoint + `?${payload}`, {
        method: 'GET',
        headers: await generateAuthHeaders(payload)
    })
    return res.json()
}

async function getNoAuthApi(endpoint, apiUrl) {
    const res = await fetch((apiUrl || config.httpApiUrl) + endpoint, {method: 'GET'})
    return res.json()
}

export async function postApi(action, data) {
    const payload = {...data, nonce: getNonce()}
    const res = await fetch(config.httpApiUrl + action, {
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
    return albedo.signMessage({
        message: JSON.stringify(data),
        pubkey: config.nodePubkey
    })
        .then(({message_signature}) => ({
            'Content-Type': 'application/json',
            Authorization: 'Signature ' + message_signature
        }))
}

function getNonce() {
    return new Date().getTime()
}