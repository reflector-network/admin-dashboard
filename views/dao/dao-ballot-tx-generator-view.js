import React, {useCallback, useState} from 'react'
import {Button, CodeBlock} from '@stellar-expert/ui-framework'
import {createdDaoClient} from './dao-client'
import {generateVotingTransactions} from './ballot-tx-generator'
import {StrKey} from '@stellar/stellar-sdk'

const daoChannelAccounts = [
    'GBPMF5VB7OS5J7DHWILIMHJJ7AP6ERRC66VW7BTGTGXD2PJ2XVFQRDAO',
    'GAOQ6DWV5PMVC3ZCRJ2P3IOMTMFPAYCL6MKS7MFHWRDVGEL6CEZXECDI',
    'GDTU7VQMK7SWZZE6KSGUVV7KOC6LJZDYUVTDSCHVTVTWVSYW7HA5OHEX',
    'GCYYPP4SGODHBBGHYTJNFLB3R65QDFA4V2JYWDEGO6J2O47ALX7FPNA7',
    'GBNG2UB3YDSK2V2FP7EI63IJA7POESGUBXZNLL3SRA2EP3KZWIRKQGDQ',
]

export default function DaoBallotTxGeneratorView() {
    const [ballotId, setBallotId] = useState()
    const [source, setSource] = useState(daoChannelAccounts[0])
    const [inProgress, setInProgress] = useState(false)
    const [links, setLinks] = useState()
    const updateBallotId = useCallback(e => {
        setBallotId(parseInt(e.target.value, 10) || '')
    }, [setBallotId])

    const updateSource = useCallback(e => {
        const value = e.target.value.trim()
        if (value && !StrKey.isValidEd25519PublicKey(value)) {
            return alert('Invalid source account address')
        }
        setSource(e.target.value)
    }, [setSource])

    const generate = useCallback(() => {
        setInProgress(true)
        const id = BigInt(ballotId)
        createdDaoClient('public')
            .fetchBallot(id)
            .then(ballot => generateVotingTransactions(id, ballot, source))
            .then(links => {
                setLinks(`Transactions for DAO governance vote #${id}
For: ${links.for}
Against: ${links.against}
`)
            })
            .finally(() => setInProgress(false))
    }, [ballotId, source])

    return <div className="card card-blank">
        <h2>Generate DAO ballot transactions</h2>
        <hr className="flare"/>
        <div className="space">
            <div className="row">
                <div className="column column-25">
                    <label>
                        DAO ballot id:{' '}
                        <input type="text" pattern="\d*" inputMode="numeric" value={ballotId || ''} onChange={updateBallotId}
                               style={{width: '6em'}} className="text-right" placeholder="0"/>
                    </label>
                </div>
                <div className="column column-75">
                    <label>
                        Channel account:{' '}
                        <input type="text" pattern="[A-Z0-9]" value={source || ''} onChange={updateSource}
                               placeholder="Account address"/>
                    </label>
                </div>
            </div>
            <div className="dimmed text-small">
                Other channel accounts:
                {daoChannelAccounts.map((account) => (
                    <div key={account}>
                        <a href="#" onClick={() => setSource(account)}>{account}</a>
                    </div>
                ))}
            </div>
            <div className="space row">
                <div className="column column-75"></div>
                <div className="column column-25">
                    <Button block onClick={generate} loading={inProgress} disabled={inProgress}>Generate</Button>
                </div>
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

