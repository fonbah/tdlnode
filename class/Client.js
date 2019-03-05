'use strict'
const lib = require('../sys/lib')
const api = require('../sys/api')
const Auth = require('./Auth')
const ClientApi = require('./ClientApi')
const { optsMerge } = require('../helper/index')
const { clientDefaultOptions, libDefaultOtions, tdlDefaultOptions } = require('../conf/index')

class Client {
    constructor(credentials, options = {}) {

        const libOptions = optsMerge(libDefaultOtions, options)
        const tdlOptions = optsMerge(tdlDefaultOptions, options)
        const clientOptions = optsMerge(clientDefaultOptions, options)

        const { tdlib, buildQuery } = lib(libOptions)

        const __ClientApi = new ClientApi(
            new Auth(credentials, { ...clientOptions, ...tdlOptions }),
            api(tdlib, buildQuery)
        )

        this.init = () => {
            return new Promise((resolve, reject) => {
                __ClientApi.init().then(resolve).catch(reject)
            })
        }
        this.fetch = obj => {
            return new Promise((resolve, reject) => {
                __ClientApi.fetch(obj).then(resolve).catch(reject)
            })
        }
        this.stop = () => {
            __ClientApi.stop()
        }
    }
}

module.exports = Client