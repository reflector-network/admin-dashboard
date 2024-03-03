export default function objectKeySorter(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return obj
    }
    if (Array.isArray(obj)) {
        return obj.map(objectKeySorter)
    }
    return Object.keys(obj).sort().reduce((sortedObj, key) => {
        sortedObj[key] = objectKeySorter(obj[key])
        return sortedObj
    }, {})
}