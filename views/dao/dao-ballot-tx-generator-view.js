import React, {useCallback, useState} from 'react'
import {Button, CodeBlock} from '@stellar-expert/ui-framework'
import {createdDaoClient} from './dao-client'
import {generateVotingTransactions} from './ballot-tx-generator'

export default function DaoBallotTxGeneratorView() {
    const [ballotId, setBallotId] = useState()
    const [inProgress, setInProgress] = useState(false)
    const [links, setLinks] = useState()
    const updateBallotId = useCallback(e => {
        setBallotId(parseInt(e.target.value, 10) || '')
    }, [setBallotId])

    const generate = useCallback(() => {
        setInProgress(true)
        const id = BigInt(ballotId)
        createdDaoClient('public')
            .fetchBallot(id)
            .then(ballot => generateVotingTransactions(id, ballot))
            .then(links => {
                setLinks(`Transactions for DAO governance vote #${id}
For: ${links.for}
Against: ${links.against}
`)
            })
            .finally(() => setInProgress(false))
    }, [ballotId])

    return <div className="card card-blank">
        <h2>Generate DAO ballot transactions</h2>
        <hr className="flare"/>
        <div className="space">
            <label>
                DAO ballot id:{' '}
                <input type="text" pattern="\d*" inputMode="numeric" value={ballotId || ''} onChange={updateBallotId}
                       style={{width: '6em'}} className="text-right" placeholder="0"/>
            </label>
            <div className="space">
                <Button onClick={generate} loading={inProgress} disabled={inProgress}>Generate</Button>
            </div>
        </div>
        {!!links && <>
            <hr/>
            <div className="space">
                <CodeBlock>{links}</CodeBlock>
            </div>
        </>}
    </div>
}

