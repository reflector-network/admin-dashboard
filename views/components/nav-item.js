import React from 'react'

export function NavigationItemView({title, link}) {
    if (link)
        return <a href={link}>{title}</a>
    return <span><i className="icon-angle-double-right"/>{title}</span>
}