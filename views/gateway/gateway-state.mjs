/**
 * Reads a node's GATEWAYS_GET answer. `unusable` means the node holds a gateway list and can use none of it: every entry
 * is refused, or its gateways.json could not be read. It then sends no webhooks and fetches no exchanges prices until the
 * list is fixed. After an unreadable file the node reports one empty entry, which is not a gateway to list. `noConfig`
 * is set only by a successful answer that carries neither a challenge nor a gateway: a node with nothing configured
 * still answers with a challenge, so only such an answer calls for the initial setup screen
 * @param {{urls: (string[]|null), challenge: string, unusable: boolean}} res - orchestrator response
 * @return {{gateways: string[], challenge: string, unusable: boolean, noConfig: boolean}}
 */
export function readGatewaysState(res) {
    const urls = Array.isArray(res?.urls) ? res.urls : []
    const gateways = urls.filter(url => typeof url === 'string' && url.length > 0)
    const hasChallenge = typeof res?.challenge === 'string' && res.challenge.length > 0
    return {
        gateways,
        challenge: res?.challenge,
        unusable: res?.unusable === true,
        noConfig: !hasChallenge && gateways.length === 0
    }
}

/**
 * Reads a refused or failed GATEWAYS_GET. A refusal, for example a node that is not connected, says nothing about the
 * node's configuration, so it never leads to the initial setup screen, which would invite a new config for a node that
 * already has one
 * @param {Error} [e] - the rejection
 * @return {{loadError: string, noConfig: boolean}}
 */
export function readGatewaysFailure(e) {
    return {loadError: e?.message || 'Request failed', noConfig: false}
}

/**
 * The warning shown for an unusable gateway list. Listed entries mean every configured gateway was refused; no listed
 * entry means the node could not read its gateways.json and reported only a blank placeholder
 * @param {{gateways: string[], unusable: boolean}} state - state from readGatewaysState
 * @return {string|null}
 */
export function describeUnusable(state) {
    if (!state?.unusable)
        return null
    const effect = 'This node cannot use any gateway in its list, so it sends no webhooks and fetches no exchanges prices until the list is fixed.'
    if (state.gateways?.length > 0)
        return effect + ' Every configured gateway was refused; replace or remove the refused entries.'
    return effect + ' The node could not read its gateway list; push a valid list.'
}
