import React, {useEffect, useState} from 'react'
import ActionNodeLayout from '../server-config/action-node-layout'
import AuthLayout from '../layout/auth-layout'
import InitGatewaysConfigView from './init-gateways-config-view'
import GatewaysDescription from './gateways-description-view'

export default function PublicInitialGatewaysConfigView() {
    return <AuthLayout skipClusterValidation>
        <ActionNodeLayout title="Node gateways config" settings={null}
                          description={<GatewaysDescription/>}>

            <InitGatewaysConfigView forceSetup/>
        </ActionNodeLayout>
    </AuthLayout>
}