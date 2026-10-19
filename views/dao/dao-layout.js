import React from 'react'
import {Route, RouterSwitch, useLocation} from '@stellar-expert/ui-framework'
import {MenuNavLink} from '../components/nav-item'
import DaoBallotTxView from './dao-ballot-tx-generator-view'
import ClaimDaoRewardsView from './claim-dao-rewards-view'

export default function DaoLayout() {
    return <>
        <div className="row relative" style={{zIndex: '1'}}>
            <div className="column column-25">
                <div className="segment" style={{minHeight: '50vh'}}>
                    <h2>DAO governance</h2>
                    <DaoNav/>
                </div>
                <div className="space mobile-only"/>
            </div>
            <div className="column column-75">
                <RouterSwitch>
                    <Route path="/dao/claim">
                        <ClaimDaoRewardsView/>
                    </Route>
                    <Route path="/dao/vote-tx">
                        <DaoBallotTxView/>
                    </Route>
                </RouterSwitch>
            </div>
        </div>
        <div className="space">
        </div>
    </>
}

const daoLinks = [
    {href: '/dao/vote', text: 'Governance vote'},
    {href: '/dao/claim', text: 'Claim rewards'}
]

function DaoNav() {
    const {pathname} = useLocation()
    return <ul>
        {daoLinks.map((link) => <li key={link.href}>
            <MenuNavLink link={pathname === link.href ? undefined : link.href} title={link.text}/>
        </li>)}
    </ul>
}