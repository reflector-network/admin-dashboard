import React from 'react'

export default function DialogView({dialogOpen, children}) {
    if (!dialogOpen) return null
    return <div className="dialog">
        <div className="dialog-backdrop"/>
        <div className="dialog-content container">
            <div className="row">
                <div className="column column-80 column-offset-10">
                    <div className="segment blank">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    </div>
}