import React from 'react'
import cn from 'classnames'
import './nav-item.scss'

export function MenuNavLink({title, link, sub = false}) {
    const content = link ?
        <a href={link}>{title}</a> :
        title
    return <span className={cn('menu-nav-link', {sub: !!sub, selected: !!title})}>
        {content}
    </span>
}