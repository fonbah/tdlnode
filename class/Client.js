'use strict'
const lib = require('../sys/lib')
const api = require('../sys/api')
const Auth = require('./Auth')
const ClientApi = require('./ClientApi')
const { optsMerge } = require('../helper/index')
const { clientDefaultOptions, libDefaultOtions, tdlDefaultOptions } = require('../conf/index')

module.exports = class Client {
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

        this.on = (event, callBack) => {
            __ClientApi.ClientEvent.on(event, callBack)
        }
        this.once = (event, callBack) => {
            __ClientApi.ClientEvent.once(event, callBack)
        }
        this.off = (event, callBack) => {
            __ClientApi.ClientEvent.off(event, callBack)
        }

        this.input = __ClientApi.Auth.clientInput
    }
}