export default function configChangesDetector(configuration) {
    const pendingConfig = configuration.pendingConfig?.config
    const currentConfig = configuration.currentConfig?.config
    const changedData = []

    //returns an empty array if nothing is compared
    if (!pendingConfig || !currentConfig)
        return changedData

    if (pendingConfig.wasmHash !== currentConfig.wasmHash) {
        changedData.push({
            type: 'wasmHash',
            changes: pendingConfig.wasmHash
        })
    }

    //compare contracts (added, changed, removed)
    const changedContracts = compareContracts(pendingConfig, currentConfig, changedData)
    const addedContracts = Object.keys(pendingConfig.contracts).filter(contractId => !currentConfig.contracts[contractId])
    const removedContracts = Object.keys(currentConfig.contracts).filter(contractId => !pendingConfig.contracts[contractId])

    Object.keys(changedContracts).forEach(contract => {
        changedData.push({
            type: 'contract',
            action: 'Changed',
            contract,
            changes: changedContracts[contract]
        })
    })

    addedContracts.forEach(contract => {
        changedData.push({
            type: 'contract',
            action: 'Added',
            contract,
            changes: pendingConfig.contracts[contract] || {}
        })
    })

    removedContracts.forEach(contract => {
        changedData.push({
            type: 'contract',
            action: 'Removed',
            contract,
            changes: currentConfig.contracts[contract] || {}
        })
    })

    //compare nodes (added, changed, removed)
    const newNodes = pendingConfig.nodes.filter(node =>
        currentConfig.nodes.findIndex(n => n.pubkey === node.pubkey) === -1)
    if (newNodes.length) {
        changedData.push({
            type: 'nodes',
            action: 'Added',
            changes: newNodes
        })
    }

    const changedNodes = pendingConfig.nodes.filter(node =>
        currentConfig.nodes.findIndex(n => n.url === node.url) === -1 &&
        newNodes.findIndex(n => n.pubkey === node.pubkey) === -1)
    if (changedNodes.length) {
        changedData.push({
            type: 'nodes',
            action: 'Changed',
            changes: changedNodes
        })
    }

    const removedNodes = pendingConfig.nodes.filter(node => node.remove)
    if (removedNodes.length) {
        changedData.push({
            type: 'nodes',
            action: 'Removed',
            changes: removedNodes
        })
    }

    return changedData
}

function compareContracts(pendingConfig, currentConfig) {
    const changedContracts = {}
    Object.values(pendingConfig.contracts).forEach(contract => {
        const compareContract = currentConfig.contracts[contract.oracleId]
        const changedProperties = []

        if (compareContract && contract.period !== compareContract.period) {
            changedProperties.push({
                type: 'period',
                changes: contract.period
            })
        }

        if (compareContract && contract.assets.length !== compareContract.assets.length) {
            const newAssets = contract.assets.filter(asset =>
                compareContract.assets.findIndex(a => a.code === asset.code) === -1)
            changedProperties.push({
                type: 'assets',
                changes: newAssets
            })
        }

        if (changedProperties.length) {
            changedContracts[contract.oracleId] = changedProperties
        }
    })
    return changedContracts
}