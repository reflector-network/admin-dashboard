import {useEffect, useReducer} from 'react'
import clientStatus from './client-status'

/**
 * Subscribe the calling component to client status changes
 * @return {ClientStatus}
 */
export function useClientStatus() {
    const forceUpdate = useReducer(c => c + 1, 0)[1]
    useEffect(() => clientStatus.subscribe(forceUpdate), [])
    return clientStatus
}
