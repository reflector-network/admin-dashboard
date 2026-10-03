const openStatuses = {
    voting: 'Waiting for votes',
    pending: 'Approved, waiting for its switch time'
}

const withdrawWarning = 'Withdrawing rejects this update for the whole cluster. It cannot be undone; the change has to be proposed again.'

/**
 * What the current key can do about the update that is open for votes. A vote can change for as long as the update is
 * voting or waiting for its switch time; the initiator's rejection withdraws the update, which the orchestrator then
 * rejects outright
 * @param {{pendingConfig: {config: {status: string, signatures: {pubkey: string, rejected: boolean}[]}}}} configuration - GET /config response
 * @param {string} publicKey - the signed-in key
 * @return {{update: object, statusText: string, ownVote: ?string, isInitiator: boolean, actions: {label: string, reject: boolean, confirm: ?string}[]}|null}
 */
export function readVoteState(configuration, publicKey) {
    const update = configuration?.pendingConfig?.config
    if (!update || !openStatuses[update.status])
        return null
    const signatures = update.signatures || []
    const own = signatures.find(signature => signature.pubkey === publicKey)
    const ownVote = own ? (own.rejected ? 'rejected' : 'approved') : null
    const isInitiator = signatures[0]?.pubkey === publicKey
    let actions
    if (isInitiator)
        actions = [{label: 'Withdraw', reject: true, confirm: withdrawWarning}]
    else if (ownVote === 'approved')
        actions = [{label: 'Change to reject', reject: true}]
    else if (ownVote === 'rejected')
        actions = [{label: 'Change to approve', reject: false}]
    else
        actions = [{label: 'Approve', reject: false}, {label: 'Reject', reject: true}]
    return {update, statusText: openStatuses[update.status], ownVote, isInitiator, actions}
}
