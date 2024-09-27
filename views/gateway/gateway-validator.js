import {postApi} from '../../api/interface'

const validatedGateways = {}

/**
 * @param {string[]} gateways
 * @param {string} validationKey
 * @return {Promise<{status: string}|*>}
 */
export async function validateGateways(gateways, validationKey) {
    const gatewaysToValidate = []
    const res = {}
    for (let gateway of gateways) {
        const prev = validatedGateways[gateway]
        if (prev?.status === 'healthy') {
            res[gateway] = 'healthy'
        } else {
            gatewaysToValidate.push(gateway)
        }
    }
    try {
        const validationResult = await postApi('validate-gateways', {urls: gatewaysToValidate, validationKey})
        for (const [gateway, result] of Object.entries(validationResult)) {
            let status = result.status
            if (result.error) {
                status += ` (${result.error})`
            }
            res[gateway] = validatedGateways[gateway] = status
        }
    } catch (e) {
        console.error(e)
        for (let gateway of gatewaysToValidate) {
            res[gateway] = 'unknown (validation request failed)'
        }
    }
    return res
}