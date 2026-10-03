import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readApiResponse} from './api-response.mjs'

const response = (status, body) => ({ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body)})

test('a success resolves with the body', async () => {
    assert.deepEqual(await readApiResponse(response(200, {urls: []})), {urls: []})
})

test('a refusal rejects with the orchestrator error text', async () => {
    await assert.rejects(readApiResponse(response(400, {error: 'Gateway URL must use http or https, got ftp:', status: 400})), /Gateway URL must use http or https/)
})

test('a refusal without a json body rejects with its status', async () => {
    const res = {ok: false, status: 502, json: () => Promise.reject(new SyntaxError('Unexpected token <'))}
    await assert.rejects(readApiResponse(res), /Request failed with status 502/)
})
