import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readVoteState} from './update-vote-state.mjs'

const initiator = 'GINITIATOR'
const signer = 'GSIGNER'
const other = 'GOTHER'

function configuration(status, signatures) {
    return {
        currentConfig: {config: {status: 'applied', signatures: [{pubkey: initiator, rejected: false}]}},
        pendingConfig: status ? {config: {status, signatures}} : null
    }
}

const approved = pubkey => ({pubkey, rejected: false})
const rejected = pubkey => ({pubkey, rejected: true})

test('with no update to vote on there is nothing to show, and the applied config is not one', () => {
    assert.equal(readVoteState(configuration(null), other), null)
    assert.equal(readVoteState({currentConfig: null, pendingConfig: null}, other), null)
    assert.equal(readVoteState(undefined, other), null)
})

test('an update that is no longer open for votes is not shown', () => {
    assert.equal(readVoteState(configuration('rejected', [approved(initiator)]), other), null)
    assert.equal(readVoteState(configuration('applied', [approved(initiator)]), other), null)
})

test('a signer who has not voted can approve or reject', () => {
    const state = readVoteState(configuration('voting', [approved(initiator)]), other)
    assert.equal(state.ownVote, null)
    assert.equal(state.isInitiator, false)
    assert.deepEqual(state.actions, [{label: 'Approve', reject: false}, {label: 'Reject', reject: true}])
})

test('a signer who approved can change to reject, while the update votes or waits for its switch time', () => {
    for (const status of ['voting', 'pending']) {
        const state = readVoteState(configuration(status, [approved(initiator), approved(signer)]), signer)
        assert.equal(state.ownVote, 'approved')
        assert.deepEqual(state.actions, [{label: 'Change to reject', reject: true}])
    }
})

test('a signer who rejected can change to approve', () => {
    const state = readVoteState(configuration('voting', [approved(initiator), rejected(signer)]), signer)
    assert.equal(state.ownVote, 'rejected')
    assert.deepEqual(state.actions, [{label: 'Change to approve', reject: false}])
})

test('the initiator can only withdraw, and is asked to confirm', () => {
    for (const status of ['voting', 'pending']) {
        const state = readVoteState(configuration(status, [approved(initiator), approved(signer)]), initiator)
        assert.equal(state.isInitiator, true)
        assert.equal(state.ownVote, 'approved')
        assert.deepEqual(state.actions, [{
            label: 'Withdraw',
            reject: true,
            confirm: 'Withdrawing rejects this update for the whole cluster. It cannot be undone; the change has to be proposed again.'
        }])
    }
})

test('the status line says what the update waits for', () => {
    assert.equal(readVoteState(configuration('voting', [approved(initiator)]), other).statusText, 'Waiting for votes')
    assert.equal(readVoteState(configuration('pending', [approved(initiator), approved(signer)]), other).statusText, 'Approved, waiting for its switch time')
})

test('the update to sign is the pending one', () => {
    const config = configuration('voting', [approved(initiator)])
    assert.equal(readVoteState(config, other).update, config.pendingConfig.config)
})
