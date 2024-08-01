import isEqual from 'react-fast-compare'

let changedData = []

export default function detectConfigChanges(pendingConfig, currentConfig) {
    changedData = []
    //returns an empty array if nothing is compared
    if (!pendingConfig || !currentConfig || isEqual(pendingConfig, currentConfig))
        return changedData

    compareObjects(pendingConfig, currentConfig)
    return changedData
}

function compareObjects(a, b) {
    for (const key of Object.keys(a)) {
        const value = a[key]
        //check differences for object value
        if (value !== null && typeof value === 'object') {
            switch (key) {
                case 'nodes':
                    compareNodes(a, b)
                    continue
                case 'contracts':
                    compareContracts(a, b)
                    continue
                default:
                    compareObjects(value, b[key] || {})
                    continue
            }
        }
        compareAtomicProperty(a, b, key)
    }

    const removedProperties = Object.keys(b).filter(prop => !a.hasOwnProperty(prop))
    for (const prop of removedProperties) {
        changedData.push({
            type: prop,
            action: 'removed',
            changes: b[prop]
        })
    }
}

function compareAtomicProperty(a, b, key) {
    if (['minDate'].includes(key))
        return //ignore certain properties

    if (a[key] === b[key])
        return

    changedData.push({
        type: key,
        action: (a.hasOwnProperty(key) && !b.hasOwnProperty(key)) ? 'added' : 'updated',
        changes: a[key]
    })
}

//compare nodes (added, changed, removed)
function compareNodes(pendingConfig, currentConfig) {
    const newNodes = Object.values(pendingConfig.nodes).filter(node => !currentConfig.nodes[node.pubkey])
    if (newNodes.length) {
        changedData.push({
            type: 'nodes',
            action: 'added',
            uid: newNodes[0].pubkey,
            changes: newNodes
        })
    }

    const currentConfigNodes = Object.values(currentConfig.nodes)

    const changedUrlNodes = Object.values(pendingConfig.nodes).filter(node =>
        !currentConfigNodes.some(n => n.url === node.url) &&
        !newNodes.some(n => n.pubkey === node.pubkey))
    const changedDomainNodes = Object.values(pendingConfig.nodes).filter(node =>
        !currentConfigNodes.some(n => n.domain === node.domain) &&
        !newNodes.some(n => n.pubkey === node.pubkey))

    const updates = {}
    //combine changes in one node
    const changedNodes = changedDomainNodes.filter(node => changedUrlNodes.some(n => n.pubkey === node.pubkey))

    for (const {pubkey, url} of changedUrlNodes) {
        updates[pubkey] = {...updates[pubkey], url, pubkey}
    }

    for (const {pubkey, domain} of changedDomainNodes) {
        updates[pubkey] = {...updates[pubkey], domain, pubkey}
    }

    for (const node of changedNodes) {
        updates[node.pubkey] = {...node, uid: node.pubkey}
    }

    if (Object.keys(updates).length) {
        changedData.push({
            type: 'nodes',
            action: 'updated',
            changes: Object.values(updates || {})
        })
    }

    const removedNodes = Object.values(currentConfig.nodes).filter(node => !pendingConfig.nodes[node.pubkey])

    if (removedNodes.length) {
        changedData.push({
            type: 'nodes',
            action: 'removed',
            changes: removedNodes
        })
    }
}

//compare contracts (added, changed, removed)
function compareContracts(pendingConfig, currentConfig) {
    const changedContracts = compareContractProps(pendingConfig, currentConfig)
    const addedContracts = Object.keys(pendingConfig.contracts).filter(contractId => !currentConfig.contracts[contractId])
    const removedContracts = Object.keys(currentConfig.contracts).filter(contractId => !pendingConfig.contracts[contractId])

    for (const [contract, changes] of Object.entries(changedContracts)) {
        changedData.push({
            type: 'contract',
            action: 'updated',
            uid: contract,
            changes
        })
    }

    for (const contract of addedContracts) {
        changedData.push({
            type: 'contract',
            action: 'added',
            uid: contract,
            changes: pendingConfig.contracts[contract] || {}
        })
    }

    for (const contract of removedContracts) {
        changedData.push({
            type: 'contract',
            action: 'removed',
            uid: contract,
            changes: currentConfig.contracts[contract] || {}
        })
    }
}

function compareContractProps(pendingConfig, currentConfig) {
    const changedContracts = {}
    for (const contract of Object.values(pendingConfig.contracts)) {
        const existingContract = currentConfig.contracts[contract.oracleId]
        const changedProperties = []
        if (!existingContract)
            continue
        //compare simple property
        for (const [type, changes] of Object.entries(contract || {})) {
            if (typeof changes !== 'object' && changes !== existingContract[type]) {
                changedProperties.push({
                    type,
                    changes
                })
            }
        }
        if (!isEqual(contract.baseAsset, existingContract.baseAsset)) {
            changedProperties.push({
                type: 'baseAsset',
                changes: contract.baseAsset
            })
        }
        //compare assets
        const addedAssets = contract?.assets.filter(asset => !existingContract?.assets.some(a => a.code === asset.code)) || []
        if (addedAssets.length) {
            changedProperties.push({
                type: 'assets',
                action: 'added',
                changes: addedAssets
            })
        }
        const removedAssets = existingContract?.assets.filter(asset => !contract.assets.some(a => a.code === asset.code)) || []
        if (removedAssets.length) {
            changedProperties.push({
                type: 'assets',
                action: 'removed',
                changes: removedAssets
            })
        }

        if (changedProperties.length) {
            changedContracts[contract.oracleId] = changedProperties
        }
    }
    return changedContracts
}