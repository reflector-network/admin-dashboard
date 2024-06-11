import isEqual from "react-fast-compare"

let changedData = []

export default function configChangesDetector(pendingConfig, currentConfig) {
    changedData = []
    //returns an empty array if nothing is compared
    if (!pendingConfig || !currentConfig || isEqual(pendingConfig, currentConfig))
        return changedData

    compareObjects(pendingConfig, currentConfig)
    return changedData
}

function compareObjects(obj1, obj2) {
    Object.keys(obj1).forEach(key => {
        const value = obj1[key]
        //check differences for object value
        if (value !== null && typeof value === 'object') {
            switch (key) {
                case 'nodes': return compareNodes(obj1, obj2)
                case 'contracts': return compareContracts(obj1, obj2)
                default: return compareObjects(value, obj2[key] || {})
            }
        }
        compareSimpleProperty(obj1, obj2, key)
    })

    const removedProperties = Object.keys(obj2).filter(prop => !obj1.hasOwnProperty(prop))
    removedProperties.forEach(prop => {
        changedData.push({
            type: prop,
            action: 'Removed',
            changes: obj2[prop]
        })
    })
}

function compareSimpleProperty(obj1, obj2, key) {
    if (obj1[key] === obj2[key])
        return

    changedData.push({
        type: key,
        action: (obj1.hasOwnProperty(key) && !obj2.hasOwnProperty(key)) ? 'Added' : 'Changed',
        changes: obj1[key]
    })
}

//compare nodes (added, changed, removed)
function compareNodes(pendingConfig, currentConfig) {
    const newNodes = Object.values(pendingConfig.nodes).filter(node => !currentConfig.nodes[node.pubkey])
    if (newNodes.length) {
        changedData.push({
            type: 'nodes',
            action: 'Added',
            uniqId: newNodes[0].pubkey,
            changes: newNodes
        })
    }

    const changedUrlNodes = Object.values(pendingConfig.nodes).filter(node =>
        Object.values(currentConfig.nodes).findIndex(n => n.url === node.url) === -1 &&
        newNodes.findIndex(n => n.pubkey === node.pubkey) === -1)
    const changedDomainNodes = Object.values(pendingConfig.nodes).filter(node =>
        Object.values(currentConfig.nodes).findIndex(n => n.domain === node.domain) === -1 &&
        newNodes.findIndex(n => n.pubkey === node.pubkey) === -1)
    const changedNodes = {}
    //combine changes in one node
    const changedSameNodes = changedDomainNodes.filter(node => changedUrlNodes.findIndex(n => n.pubkey === node.pubkey) !== -1)

    changedUrlNodes.forEach(({pubkey, url}) => {
        changedNodes[pubkey] = {...changedNodes[pubkey], url, pubkey}
    })

    changedDomainNodes.forEach(({pubkey, domain}) => {
        changedNodes[pubkey] = {...changedNodes[pubkey], domain, pubkey}
    })

    changedSameNodes.forEach(node => {
        changedNodes[node.pubkey] = {...node, uniqId: node.pubkey}
    })

    if (Object.keys(changedNodes).length) {
        changedData.push({
            type: 'nodes',
            action: 'Changed',
            changes: Object.values(changedNodes || {})
        })
    }

    const removedNodes = Object.values(currentConfig.nodes).filter(node => !pendingConfig.nodes[node.pubkey])
    if (removedNodes.length) {
        changedData.push({
            type: 'nodes',
            action: 'Removed',
            changes: removedNodes
        })
    }
}

//compare contracts (added, changed, removed)
function compareContracts(pendingConfig, currentConfig) {
    const changedContracts = compareDiffContracts(pendingConfig, currentConfig)
    const addedContracts = Object.keys(pendingConfig.contracts).filter(contractId => !currentConfig.contracts[contractId])
    const removedContracts = Object.keys(currentConfig.contracts).filter(contractId => !pendingConfig.contracts[contractId])

    Object.keys(changedContracts).forEach(contract => {
        changedData.push({
            type: 'contract',
            action: 'Changed',
            uniqId: contract,
            changes: changedContracts[contract]
        })
    })

    addedContracts.forEach(contract => {
        changedData.push({
            type: 'contract',
            action: 'Added',
            uniqId: contract,
            changes: pendingConfig.contracts[contract] || {}
        })
    })

    removedContracts.forEach(contract => {
        changedData.push({
            type: 'contract',
            action: 'Removed',
            uniqId: contract,
            changes: currentConfig.contracts[contract] || {}
        })
    })

}

function compareDiffContracts(pendingConfig, currentConfig) {
    const changedContracts = {}
    Object.values(pendingConfig.contracts).forEach(contract => {
        const compareContract = currentConfig.contracts[contract.oracleId]
        const changedProperties = []
        if (!compareContract)
            return
        //compare simple property
        Object.keys(contract || {}).forEach(prop => {
            if (typeof contract[prop] !== 'object' && contract[prop] !== compareContract[prop]) {
                changedProperties.push({
                    type: prop,
                    changes: contract[prop]
                })
            }
        })
        if (!isEqual(contract.baseAsset, compareContract.baseAsset)) {
            changedProperties.push({
                type: 'baseAsset',
                changes: contract.baseAsset
            })
        }
        //compare assets
        const addedAssets = contract?.assets.filter(asset =>
            compareContract?.assets.findIndex(a => a.code === asset.code) === -1) || []
        if (addedAssets.length) {
            changedProperties.push({
                type: 'assets',
                action: 'Added',
                changes: addedAssets
            })
        }
        const removedAssets = compareContract?.assets.filter(asset =>
            contract.assets.findIndex(a => a.code === asset.code) === -1) || []
        if (removedAssets.length) {
            changedProperties.push({
                type: 'assets',
                action: 'Removed',
                changes: removedAssets
            })
        }

        if (changedProperties.length) {
            changedContracts[contract.oracleId] = changedProperties
        }
    })
    return changedContracts
}