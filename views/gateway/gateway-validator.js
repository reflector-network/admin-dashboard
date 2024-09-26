const validatedGateways = {}

export async function validateGateway(address, validationKey) {
    const prev = validatedGateways[address]
    if (prev?.status === 'healthy')
        return prev
    const info = {status: 'unreachable'}
    validatedGateways[address] = info
    try {
        const {version} = await fetchGateway(address + '/', validationKey)
        info.version = version
        info.status = 'alive'

        const {serverTime} = await fetchGateway(address + '/gateway?url=' + encodeURIComponent('https://api.binance.com/api/v3/time'), validationKey)
        if (!serverTime)
            throw new Error('Failed to check proxy connection with Binance API')
        info.status = 'healthy'
    } catch (e) {
        console.error(e)
        info.error = e.message
    }
    return info
}

async function fetchGateway(address, validationKey) {
    const res = await fetch(address, {headers: {'x-gateway-validation': validationKey}})
    return await res.json()
}