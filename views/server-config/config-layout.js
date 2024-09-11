import React from 'react'

export default function ConfigLayout({title, description, children, primaryAction}) {
    return <div className="segment blank h-100">
        <div className="row">
            <div className="column column-66">
                <h2>{title}</h2>
            </div>
            {!!primaryAction && <div className="column column-34 text-right mobile-left" style={{paddingTop: '0.5em'}}>
                {primaryAction}
            </div>}
        </div>
        <hr className="flare"/>
        {description ?
            <div className="row space" style={{minHeight: 'calc(100% - 7em)'}}>
                <div className="column column-66">{children}</div>
                <div className="column column-34 text-small dimmed space" style={{borderLeft: '1px solid #555', paddingLeft: '2em'}}>
                    {description}
                </div>
            </div> :
            <div className="space">{children}</div>}
    </div>
}