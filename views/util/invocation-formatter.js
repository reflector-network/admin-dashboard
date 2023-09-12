function space(level) {
    return ' '.repeat(level * 4)
}

export default function invocationFormatter(value, level) {
    if (value instanceof Array) {
        return `[
${space(level)}${value.map(v => invocationFormatter(v, level + 1)).join(',\n' + space(level))}
${space(level - 1)}]`
    }
    if (value !== null && typeof value === 'object') {
        const args = []
        for (const key of Object.keys(value)) {
            const nestedValue = invocationFormatter(value[key], level + 1)
            if (nestedValue) {
                args.push(space(level) + `${key}: ${nestedValue}`)
            }
        }
        return !args.length ? '' : `{
${args.join(',\n')}
${space(level - 1)}}`
    }
    if (typeof value === 'string') {
        if (!value)
            return value
        return `'${value.trim().replace('\'', '\\\'')}'`
    }
    return value
}