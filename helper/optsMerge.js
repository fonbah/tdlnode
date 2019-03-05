'use strict'
module.exports = (defaultOptions, options) => {
    const tmp = {}
    for (let key in defaultOptions) {
        if (options.hasOwnProperty(key)) {
            tmp[key] = options[key]
        } else {
            tmp[key] = defaultOptions[key]
        }
    }
    return tmp
}