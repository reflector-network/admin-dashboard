import isEqual from 'react-fast-compare'
import invocationFormatter from "./invocation-formatter"

let changedData = []

export default function detectConfigChanges(pendingConfig, currentConfig) {
    changedData = []
    //returns an empty array if nothing is compared
    if (!pendingConfig || !currentConfig || isEqual(pendingConfig, currentConfig))
        return changedData

    compareObjects(pendingConfig, currentConfig)
    return changedData
}

function compareObjects(a, b, parentProperty) {
    for (const key of Object.keys(a)) {
        const value = a[key]
        const parentPropertyPath = `${parentProperty || ''}${parentProperty ? ' ->': ''} ${key}`
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
                    (typeof value === typeof  b[key]) ?
                        compareObjects(value, b[key] || {}, parentPropertyPath) :
                        addDifferentTypesChanges(value, key)
                    continue
            }
        }
        compareAtomicProperty(a, b, key, parentProperty)
    }

    const removedProperties = Object.keys(b).filter(prop => !a.hasOwnProperty(prop))
    for (const prop of removedProperties) {
        changedData.push({
            variety: prop,
            action: 'removed',
            changes: b[prop]
        })
    }
}

function compareAtomicProperty(a, b, key, parentProperty) {
    if (['minDate'].includes(key))
        return //ignore certain properties

    if (a[key] === b[key])
        return

    changedData.push({
        variety: parentProperty ? parentProperty.trim() + ' -> ' + key : key,
        action: (a.hasOwnProperty(key) && !b.hasOwnProperty(key)) ? 'added' : 'updated',
        changes: a[key]
    })
}

function addDifferentTypesChanges(value, key) {
    changedData.push({
        variety: key,
        action: 'updated',
        changes: invocationFormatter(value || {}, 1)
    })
}

//compare nodes (added, changed, removed)
function compareNodes(pendingConfig, currentConfig) {
    const newNodes = Object.values(pendingConfig.nodes).filter(node => !currentConfig.nodes[node.pubkey])
    if (newNodes.length) {
        changedData.push({
            variety: 'nodes',
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
            variety: 'nodes',
            action: 'updated',
            changes: Object.values(updates || {})
        })
    }

    const removedNodes = Object.values(currentConfig.nodes).filter(node => !pendingConfig.nodes[node.pubkey])

    if (removedNodes.length) {
        changedData.push({
            variety: 'nodes',
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
            variety: 'contract',
            action: 'updated',
            uid: contract,
            type: pendingConfig.contracts[contract].type || 'oracle',
            changes
        })
    }

    for (const contract of addedContracts) {
        changedData.push({
            variety: 'contract',
            action: 'added',
            uid: contract,
            type: pendingConfig.contracts[contract].type || 'oracle',
            changes: pendingConfig.contracts[contract] || {}
        })
    }

    for (const contract of removedContracts) {
        changedData.push({
            variety: 'contract',
            action: 'removed',
            uid: contract,
            type: currentConfig.contracts[contract].type || 'oracle',
            changes: currentConfig.contracts[contract] || {}
        })
    }
}

function compareContractProps(pendingConfig, currentConfig) {
    const changedContracts = {}
    for (const contract of Object.values(pendingConfig.contracts)) {
        const contractId = contract.contractId || contract.oracleId
        const existingContract = currentConfig.contracts[contractId]
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
                variety: 'baseAsset',
                changes: contract.baseAsset
            })
        }
        //compare assets
        const addedAssets = contract.assets?.filter(asset => !existingContract.assets?.some(a => a.code === asset.code)) || []
        if (addedAssets.length) {
            changedProperties.push({
                variety: 'assets',
                action: 'added',
                changes: addedAssets
            })
        }
        const removedAssets = existingContract.assets?.filter(asset => !contract.assets.some(a => a.code === asset.code)) || []
        if (removedAssets.length) {
            changedProperties.push({
                variety: 'assets',
                action: 'removed',
                changes: removedAssets
            })
        }

        if (changedProperties.length) {
            changedContracts[contractId] = changedProperties
        }
    }
    return changedContracts
}