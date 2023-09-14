import React from 'react'
import {Switch, Router, Route, Redirect} from 'react-router'
import clientStatus from '../state/client-status'
import Layout from './top-layout/layout-view'
import AuthLayout from './layout/auth-layout'
import NotFoundPage from './pages/not-found'
import Dashboard from './pages/dashboard'
import ConnectionPage from './pages/connection'
import InitializationProgressPage from './pages/initialization-progress'
import ServerConfigurationPage from './pages/server-configuration'

export default function AppRouter({history}) {
    return <Router history={history}>
        <Layout>
            <Switch>
                <Route path="/" exact>
                    {!clientStatus.apiOrigin ?
                        <Redirect to="/connect"/> :
                        <AuthLayout><Dashboard/></AuthLayout>}
                </Route>
                <Route path="/config">
                    {!clientStatus.apiOrigin ?
                        <Redirect to="/connect"/> :
                        <ServerConfigurationPage/>}
                </Route>
                <Route path="/connect"><ConnectionPage/></Route>
                <Route path="/initialization-progress" component={InitializationProgressPage}/>
                <Route component={NotFoundPage}/>
            </Switch>
        </Layout>
    </Router>
}