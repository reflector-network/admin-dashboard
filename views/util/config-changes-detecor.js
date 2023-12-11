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

    //compare contracts, period and assets
    Object.values(pendingConfig.contracts).forEach(contract => {
        const compareContract = currentConfig.contracts[contract.oracleId]
        if (!compareContract) {
            changedData.push({
                type: 'contract',
                changes: contract
            })
        }

        if (contract.period !== compareContract.period) {
            changedData.push({
                type: 'period',
                contract: contract.oracleId,
                changes: contract.period
            })
        }

        if (contract.assets.length !== compareContract.assets.length) {
            const newAssets = contract.assets.filter(asset =>
                compareContract.assets.findIndex(a => a.code === asset.code) === -1)
            changedData.push({
                type: 'assets',
                contract: contract.oracleId,
                changes: newAssets
            })
        }

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