import React from 'react'
import ConfigLayout from '../server-config/config-layout'

export default function GovernanceVoteView() {
    return <ConfigLayout title="Governance Vote">
        <div className="dimmed text-center text-small space">(no active governance ballots)</div>
    </ConfigLayout>
}