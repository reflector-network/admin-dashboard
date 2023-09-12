import React from 'react'

export default function SimplePageLayout({title, children}) {
    return <div className="row space">
        <div className="column column-50 column-offset-25">
            <div className="segment blank">
                <h3 className="text-center">{title}</h3>
                <hr className="flare"/>
                <div className="space" style={{padding: '0 1em'}}>
                    {children}
                </div>
            </div>
        </div>
    </div>
}