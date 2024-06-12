import React, {useCallback, useState} from 'react'
import {Button} from '@stellar-expert/ui-framework'
import DialogView from '../components/dialog-view'
import ActionConfirmationFormView from './action-form-confirmation-view'

export default function ActionNodeLayout({settings, title, timeframe, isValid, children}) {
    const [isOpen, setIsOpen] = useState(false)

    const toggleShowForm = useCallback(() => setIsOpen(prev => !prev), [])

    return <div className="segment blank h-100">
        <div className="row">
            <div className="column column-66">
                <h3>{title}</h3>
            </div>
            <div className="column column-33">
                {!!isValid && <Button block title="Submit pending changes" onClick={toggleShowForm}>Submit changes</Button>}
            </div>
        </div>
        <hr className="flare"/>
        <div>
            {children}
        </div>
        {!!isValid && <DialogView dialogOpen={isOpen}>
            <h3>Set up configuration update</h3>
            <hr className="flare"/>
            <ActionConfirmationFormView settings={settings} timeframe={timeframe} toggleShowForm={toggleShowForm}/>
        </DialogView>}
    </div>
}