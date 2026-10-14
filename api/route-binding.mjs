/**
 * The route binding a POST signature covers, so a request signed for one route or one node cannot be replayed against
 * another. Mirrors buildRouteBinding in node-orchestrator server/middlewares.js: the path without its leading slash, then
 * every query parameter merged with the nonce and sorted together by code unit, as sortObjectKeys orders them. A query
 * is flat, so ordering its keys is all sortObjectKeys would do; the module has no imports so node --test can load it
 * @param {string} action - endpoint, optionally with a query string
 * @param {number} nonce - the nonce the authorization header carries
 * @return {string}
 */
export function buildRouteBinding(action, nonce) {
    const [path, query = ''] = action.split('?')
    const params = Object.fromEntries(new URLSearchParams(query))
    params.nonce = nonce
    const sorted = {}
    for (const key of Object.keys(params).sort())
        sorted[key] = params[key]
    return path.replace(/^\//, '') + '?' + new URLSearchParams(sorted).toString()
}
