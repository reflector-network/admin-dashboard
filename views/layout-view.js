import React from 'react'
import {ErrorBoundary} from '@stellar-expert/ui-framework'
import ConnectionStatusView from './components/connection-status-view'

export default function Layout({children}) {
    return <div className="page-wrapper">
        <div className="page-container">
            <div className="container">
                <h1>
                    <a href="/" className="logo">
                        <img src="/img/logo.svg" alt="Reflector logo" style={{height: '3.2rem'}}/>
                        <span className="condensed" style={{color: '#789EC6', fontSize: '4rem', lineHeight: 0.85}}>REFLECTOR</span>
                    </a>
                </h1>
            </div>
            <div className="container space">
                <ErrorBoundary>{children}</ErrorBoundary>
            </div>
        </div>
        <div className="footer">
            <div className="dimmed container">
                <div className="dual-layout">
                    <div>
                        <ConnectionStatusView/>
                    </div>
                    <div>
                        Dashboard <span className="dimmed">v{appVersion}</span>&emsp;
                        &copy;&nbsp;Reflector&nbsp;{new Date().getFullYear()}&emsp;
                        <a href="mailto:info@stellar.expert" target="_blank" rel="noreferrer" className="dimmed">
                            <i className="icon-email"/> Contact us</a>&emsp;
                        <a href="https://github.com/reflector-network/admin-dashboard.git" target="_blank" rel="noreferrer"
                           className="dimmed"> <i className="icon-github"/> Source code</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
}