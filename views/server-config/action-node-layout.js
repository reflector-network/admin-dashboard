import React, {useCallback, useState} from 'react'
import {Button} from '@stellar-expert/ui-framework'
import DialogView from '../components/dialog-view'
import ActionConfirmationFormView from './changes/action-form-confirmation-view'
import ConfigLayout from './config-layout'

export default function ActionNodeLayout({settings, title, timeframe, isValid, description, children}) {
    const [isOpen, setIsOpen] = useState(false)

    const toggleShowForm = useCallback(() => setIsOpen(prev => !prev), [])
    const action = isValid &&
        <Button block title="Submit pending changes" onClick={toggleShowForm}>Propose update</Button>
    return <ConfigLayout title={title} description={description} primaryAction={action}>
        {children}
        {!!isValid && <DialogView dialogOpen={isOpen}>
            <h2>Schedule configuration update</h2>
            <hr className="flare"/>
            <ActionConfirmationFormView settings={settings} timeframe={timeframe} toggleShowForm={toggleShowForm}/>
        </DialogView>}
    </ConfigLayout>
}