import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readGatewaysState, readGatewaysFailure, describeUnusable} from './gateway-state.mjs'

test('a usable list is listed as it is', () => {
    assert.deepEqual(readGatewaysState({urls: ['http://203.0.114.7:8080'], challenge: 'c'}), {gateways: ['http://203.0.114.7:8080'], challenge: 'c', unusable: false, noConfig: false})
})

test('an unreadable gateways.json is flagged, and its placeholder entry is not a gateway', () => {
    assert.deepEqual(readGatewaysState({urls: [''], challenge: 'c', unusable: true}), {gateways: [], challenge: 'c', unusable: true, noConfig: false})
})

test('no gateways configured is an empty, usable list', () => {
    assert.deepEqual(readGatewaysState({urls: null, challenge: 'c'}), {gateways: [], challenge: 'c', unusable: false, noConfig: false})
})

test('only a successful answer with neither a challenge nor a gateway means the node has no configuration', () => {
    assert.equal(readGatewaysState({}).noConfig, true)
    assert.equal(readGatewaysState({urls: [], challenge: ''}).noConfig, true)
    assert.equal(readGatewaysState({urls: ['http://203.0.114.7:8080']}).noConfig, false)
})

test('a failed load carries the server reason and is not a missing configuration', () => {
    assert.deepEqual(readGatewaysFailure(new Error('Node is not connected')), {loadError: 'Node is not connected', noConfig: false})
    assert.deepEqual(readGatewaysFailure(undefined), {loadError: 'Request failed', noConfig: false})
})

test('the unusable warning names the cause the listed entries point to', () => {
    assert.equal(describeUnusable({gateways: ['http://203.0.114.7:8080'], unusable: false}), null)
    assert.equal(describeUnusable({gateways: ['http://203.0.114.7:8080', 'http://203.0.114.8:8080'], unusable: true}),
        'This node cannot use any gateway in its list, so it sends no webhooks and fetches no exchanges prices until the list is fixed. Every configured gateway was refused; replace or remove the refused entries.')
    assert.equal(describeUnusable({gateways: [], unusable: true}),
        'This node cannot use any gateway in its list, so it sends no webhooks and fetches no exchanges prices until the list is fixed. The node could not read its gateway list; push a valid list.')
})
