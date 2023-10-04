import React, {useCallback} from 'react'
import {observer} from 'mobx-react'
import {runInAction} from 'mobx'
import {Button} from '@stellar-expert/ui-framework'
import updateRequest from '../../state/config-update-request'

export default observer(function UpdateRequestConfirmationLayout() {
    const confirm = useCallback(() => updateRequest.confirmRequest(), [])
    const cancel = useCallback(() => runInAction(() => updateRequest.externalRequest = null), [])

    //hide confirmation if the update request doesn't exist or is confirmed
    if (!updateRequest.hasUpdate || updateRequest.isConfirmed)
        return <></>

    return <>
        <div className="segment warning">
            <div className="request-notification row row-center">
                <div className="column column-50">
                    <h3>Node configuration update request</h3>
                </div>
                <div className="column column-50">
                    <Button className="button-clear" onClick={confirm}>Continue</Button>
                    <Button className="button-clear" onClick={cancel}>Cancel</Button>
                </div>
            </div>
        </div>
        <div className="space"/>
    </>
})