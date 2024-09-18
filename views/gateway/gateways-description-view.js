import React from 'react'

export default function GatewaysDescription() {
    return <>
        <p>
            Gateways provide protection from DDoS and resource exhaustion attacks for a Reflector node. All subscription notifications
            get sent over gateway servers, masking the consensus node itself from the potential external attacks.
        </p>
        <p>
            They also balance the load while ensuring the consistency by fetching data from providers using multiple geographically
            distributed servers.
        </p>
        <p>
            A node must have at least 3 gateways to ensure high availability.
            Each gateway needs a dedicated public IPv4 to operate correctly.
        </p>
    </>
}