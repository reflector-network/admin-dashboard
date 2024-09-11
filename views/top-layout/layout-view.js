import React from 'react'
import {ErrorBoundary} from '@stellar-expert/ui-framework'
import AuthStatusView from '../status/auth-status-view'

export default function Layout({children}) {
    return <div className="page-wrapper">
        <div className="page-container">
            <div className="container">
                <h1>
                    <a href="/" className="logo">
                        <img src="/img/logo.svg" alt="Reflector logo" style={{height: '3.2rem'}}/>
                        <span className="condensed" style={{color: '#789EC6', fontSize: '4rem', lineHeight: 0.85}}>
                            REFLECTOR <span style={{fontSize: '2.6rem'}}>/ NODE ADMIN DASHBOARD</span>
                        </span>
                    </a>
                </h1>
            </div>
            <div className="container">
                <ErrorBoundary>{children}</ErrorBoundary>
            </div>
        </div>
        <div className="footer text-small">
            <div className="dimmed container">
                <div className="row">
                    <div className="column column-50 mobile-center">
                        <AuthStatusView/>
                    </div>
                    <div className="column column-50 text-right mobile-center">
                        <div>
                            <a href="mailto:info@stellar.expert" target="_blank" rel="noreferrer" className="dimmed inline-block">
                                <i className="icon-email"/> Contact us</a>&emsp;
                            <a href="https://github.com/reflector-network/admin-dashboard.git" target="_blank" rel="noreferrer"
                               className="dimmed inline-block"> <i className="icon-github"/> Source code</a>
                        </div>
                        <div>
                            Dashboard <span className="dimmed">v{appVersion}</span> &copy;&nbsp;Reflector&nbsp;{new Date().getFullYear()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}