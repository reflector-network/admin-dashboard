import React from 'react'

export default function ConfigLayout({title, description, children, primaryAction}) {
    return <div className="segment blank h-100">
        {primaryAction ?
            <div className="row">
                <div className="column column-66">
                    <h2>{title}</h2>
                </div>
                <div className="column column-34 desktop-right" style={{paddingTop: '0.5em'}}>
                    {primaryAction}
                </div>
            </div> :
            <h2>{title}</h2>}
        <hr className="flare"/>
        {description ?
            <div className="row space" style={{minHeight: 'calc(100% - 7em)'}}>
                <div className="column column-66">{children}</div>
                <div className="column column-34 text-small dimmed space">
                    <div className="space mobile-only"/>
                    <div className="desktop-only" style={{borderLeft: '1px solid #555', margin: '0.5em 2em 0 0', float: 'left', height: '100%'}}></div>
                    {description}
                </div>
            </div> :
            <div className="space">{children}</div>}
    </div>
}