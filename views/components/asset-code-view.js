import React from 'react'
import {AssetLink} from '@stellar-expert/ui-framework'
import {shortenString} from '@stellar-expert/formatter'

export default function AssetCodeView({asset}) {
    if (!asset)
        return null
    const type = parseInt(asset.type, 10)
    if (type === 1 && asset.code.length === 56) {
        return <b title={asset.code}>{shortenString(asset.code, 8)}</b>
    }
    if (type === 1) {
        return <AssetLink asset={asset.code.toUpperCase()}/>
    }
    return <b>{asset.code}</b>
}