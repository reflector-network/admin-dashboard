import React, {useCallback, useState} from 'react'
import {Button} from '@stellar-expert/ui-framework'
import DialogView from '../components/dialog-view'
import ActionConfirmationFormView from './action-form-confirmation-view'

export default function ActionNodeLayout({settings, timeframe, isValid, children}) {
    const [isOpen, setIsOpen] = useState(false)

    const toggleShowForm = useCallback(() => setIsOpen(prev => !prev), [])

    return <div className="segment blank h-100">
        <div>
            {children}
        </div>
        <div className="space row">
            <div className="column column-66">
                {(!!isValid) && <div className="dimmed text-small micro-space"> You have unsaved pending changes</div>}
                <div className="only-mobile micro-space"/>
            </div>
            <div className="column column-33">
                <Button block disabled={!isValid} onClick={toggleShowForm}>Submit</Button>
            </div>
        </div>
        {!!isValid && <DialogView dialogOpen={isOpen}>
            <h3>Setting up a configuration update</h3>
            <hr className="flare"/>
            <ActionConfirmationFormView settings={settings} timeframe={timeframe} toggleShowForm={toggleShowForm}/>
        </DialogView>}
    </div>
}