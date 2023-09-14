import {signData} from '../providers/albedo-provider'
import clientStatus from '../state/client-status'

const tunnelServer = 'https://tunnel.reflector.world/'

async function getApi(endpoint, data) {
    if (!data) {
        data = {nonce: generateNonce()}
    }
    const payload = new URLSearchParams(data).toString()
    return fetchApi(endpoint + `?${payload}`, {
        signature: await signData(payload)
    })
}

async function getNoAuthApi(endpoint, apiOrigin) {
    return fetchApi('', {apiOrigin})
}

export async function postApi(action, data) {
    const payload = {...data, nonce: generateNonce()}
    return await fetchApi(action, {
        method: 'POST',
        signature: await signData(payload),
        body: JSON.stringify(payload)
    })
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

async function fetchApi(relativeUrl, {method = 'GET', apiOrigin = undefined, signature = null, body = undefined}) {
    if (!apiOrigin) {
        apiOrigin = clientStatus.apiOrigin
    }
    const tunnelRequired = !(apiOrigin.startsWith('https://') || apiOrigin.startsWith('http://localhost') || apiOrigin.startsWith('http://127.0.0.1'))
    const url = (tunnelRequired ? tunnelServer : apiOrigin) + relativeUrl
    const headers = {'Content-Type': 'application/json'}
    if (signature) {
        headers.Authorization = 'Signature ' + signature
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

function generateAuthHeaders(data, origin) {
    return signData(data)
        .then(message_signature => ({
            'Authorization': 'Signature ' + message_signature

        }))
}

function getUrl(relativeUrl, origin = null) {
    if (!origin) {
        origin = clientStatus.apiOrigin
    }
    if (!origin.startsWith('https://') && !origin.startsWith('http://localhost') && !origin.startsWith('http://127.0.0.1')) {
        origin = tunnelServer
    }
    return origin + relativeUrl
}

function wrapTunnel(headers, url) {
    if (!origin) {
        origin = clientStatus.apiOrigin
    }
    if (origin.startsWith('https://') || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'))
        return headers
    //add proxy
    return {...headers, 'X-TUNNEL': clientStatus.apiOrigin}
}


function generateNonce() {
    return new Date().getTime()
}