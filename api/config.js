/**
 * @typedef {'httpApiUrl'|'nodePubkey'} ConfigParam
 */

//configuration params container
const config = {
    httpApiUrl: undefined,
    nodePubkey: undefined
}
//populate existing config at the beginning
for (const key of Object.keys(config)) {
    config[key] = localStorage.getItem(key)
}

/**
 * Update global configuration parameter
 * @param {ConfigParam} key
 * @param {String|undefined} value
 */
export function setGlobalConfigParam(key, value) {
    if (!config.hasOwnProperty(key))
        throw new Error('Unknown config param: ' + key)
    if (value === undefined) {
        localStorage.removeItem(key)
    } else {
        localStorage.setItem(key, value)
    }
    config[key] = value
}

export function resetNode(){
    setGlobalConfigParam('httpApiUrl', undefined)
    window.location.replace('/connect')
}

export default config