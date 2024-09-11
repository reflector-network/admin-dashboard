/**
 * @param {{}} source
 * @return {{}}
 */
export default function sortObjectKeys(source) {
    if (!source || typeof source !== 'object')
        return source

    if (Array.isArray(source))
        return source.map(sortObjectKeys)

    const sortedKeys = Object.keys(source).sort()
    const sortedObj = {}
    for (let key of sortedKeys) {
        sortedObj[key] = sortObjectKeys(source[key])
    }
    return sortedObj
}