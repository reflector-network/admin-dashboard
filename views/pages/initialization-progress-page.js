import React from 'react'
import {observer} from 'mobx-react'
import {navigation} from '@stellar-expert/navigation'
import clientStatus from '../../state/client-status'
import SimplePageLayout from '../layout/simple-page-layout'

export default observer(function InitializationProgressPage() {
    if (clientStatus.status === 'ready')
        navigation.navigate('/')

    return <SimplePageLayout title="Waiting for node initialization">
        <div className="loader"/>
        <div className="dimmed text-small space text-center">
            Please wait, server initialization is in progress
        </div>
    </SimplePageLayout>
})