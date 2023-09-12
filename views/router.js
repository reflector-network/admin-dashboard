import React from 'react'
import {Switch, Router, Route, Redirect} from 'react-router'
import config from '../api/config'
import Layout from './layout-view'
import AuthLayout from './components/auth-layout'
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
                    {!config.httpApiUrl ?
                        <Redirect to="/connect"/> :
                        <AuthLayout><Dashboard/></AuthLayout>}
                </Route>
                <Route path="/config">
                    {!config.httpApiUrl ?
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