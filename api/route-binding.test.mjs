import {test} from 'node:test'
import assert from 'node:assert/strict'
import {buildRouteBinding} from './route-binding.mjs'

//node-orchestrator server/middlewares.js rebuilds these strings from the request; its test/log-routes.test.js pins
//`logs/trace?nonce=${nonce}` and `logs/trace?node=GTARGET&nonce=${nonce}`
test('a POST without a query binds its path and the nonce', () => {
    assert.equal(buildRouteBinding('config', 1700000000000), 'config?nonce=1700000000000')
})

test('a query is merged with the nonce and sorted with it, not appended', () => {
    assert.equal(buildRouteBinding('logs/trace?node=GTARGET', 42), 'logs/trace?node=GTARGET&nonce=42')
    assert.equal(buildRouteBinding('x?z=1&a=2', 5), 'x?a=2&nonce=5&z=1')
})

test('a leading slash is dropped, as the orchestrator drops it', () => {
    assert.equal(buildRouteBinding('/gateways', 7), 'gateways?nonce=7')
})
