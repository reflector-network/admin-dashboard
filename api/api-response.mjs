/**
 * Reads an orchestrator response. A refusal rejects with the orchestrator's own error text, so it reaches the caller's
 * catch, and a refused POST /gateways is not reported as a success
 * @param {{ok: boolean, status: number, json: function(): Promise<any>}} res - fetch response
 * @return {Promise<any>} the parsed body
 */
export async function readApiResponse(res) {
    if (res.ok)
        return await res.json()
    const body = await res.json().catch(() => null)
    throw new Error(body?.error || `Request failed with status ${res.status}`)
}
