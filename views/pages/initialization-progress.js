import React from 'react'
import SimplePageLayout from '../layout/simple-page-layout'

export default function InitializationProgressPage() {
    return <SimplePageLayout title="Waiting for node initialization">
        <div className="loader"/>
        <div className="dimmed text-small space text-center">
            Please wait, server initialization is in progress
        </div>
    </SimplePageLayout>
}