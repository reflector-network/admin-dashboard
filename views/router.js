import React from 'react'
import {Switch, Router, Route, Redirect} from 'react-router'
import clientStatus from '../state/client-status'
import Layout from './top-layout/layout-view'
import AuthLayout from './layout/auth-layout'
import NotFoundPage from './pages/not-found-page'
import DashboardPage from './pages/dashboard-page'
import ConnectionPage from './pages/connection-page'
import InitializationProgressPage from './pages/initialization-progress-page'
import ServerConfigurationPage from './pages/server-configuration-page'

export default function AppRouter({history}) {
    return <Router history={history}>
        <Layout>
            <Switch>
                <Route path="/" exact>
                    <AuthLayout><DashboardPage/></AuthLayout>
                </Route>
                <Route path="/config" component={ServerConfigurationPage}/>
                <Route path="/connect"><ConnectionPage/></Route>
                <Route path="/initialization-progress" component={InitializationProgressPage}/>
                <Route component={NotFoundPage}/>
            </Switch>
        </Layout>
    </Router>
}