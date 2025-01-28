import React from 'react'
import {Route, Switch, useLocation} from 'react-router'
import ClaimDaoRewardsView from './claim-dao-rewards-view'
import {NavigationItemView} from '../components/nav-item'
import GovernanceVoteView from './governance-vote-view'

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
                <Switch>
                    <Route path="/dao/claim">
                        <ClaimDaoRewardsView/>
                    </Route>
                    <Route path="/dao/vote">
                        <GovernanceVoteView/>
                    </Route>
                </Switch>
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
            <NavigationItemView link={pathname === link.href ? undefined : link.href} title={link.text}/>
        </li>)}
    </ul>

}