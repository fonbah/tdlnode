'use strict'
const ClientEvent = require('./ClientEvent')
const err = require('./err')

const interval = 1000

module.exports = class ClientApi {
    constructor(Auth, api) {
        this.Auth = Auth
        this.api = api
        this.ClientEvent = new ClientEvent

        let current = 0
        const extras = new Map

        this.__delExtra = uid => {
            if (extras.has(uid)) {
                extras.delete(uid)
            }
        }
        this.__defExtra = () => {
            const uid = current++
            const expect = new Promise((resolve, reject) => {
                extras.set(uid, { resolve, reject })
            })
            return { uid, expect }
        }
        this.__getExtra = uid => {
            if (extras.has(uid)) {
                return extras.get(uid)
            }
            return Promise
        }

        this.extraSize = () => {
            return current
        }

        this.__req = this.__req.bind(this)
    }

    init() {
        if (this.Auth.__started()) {
            console.log('Client has been inited already')
            return Promise.reject(null)
        }
        this.__run()
        return new Promise((resolve, reject) => {
            this.Auth.__initStart({ resolve, reject })
        })
    }

    fetch(obj) {
        const { uid, expect } = this.__defExtra()
        obj['@extra'] = uid
        try {
            this.api.send(obj)
        } catch (e) {
            this.__getExtra(uid).reject(e)
            this.__delExtra(uid)
        }
        return expect
    }

    async __req() {
        const update = this.api.receive()

        if (!update) {
            console.log('unexpected update ', update)
            this.stop()
            return
        }

        switch (update['@type']) {
            case 'updateAuthorizationState': {
                const authObj = await this.Auth.buildQuery(update).catch(console.log)
                this.api.send(authObj)
                this.__run(interval / 5)
                break
            }
            case 'error': {
                if (update.hasOwnProperty('@extra')) {
                    this.getExtra(update['@extra']).reject(update)
                    this.delExtra(update['@extra'])
                    err(update)
                }
                this.__run(interval * 10)
                break
            }
            default:
                if (update.hasOwnProperty('@extra')) {
                    try {
                        this.__getExtra(update['@extra']).resolve(update)
                    } catch (e) {
                        console.log(e)
                    }
                    this.__delExtra(update['@extra'])
                }
                this.ClientEvent.play(update)
                const ms = this.extraSize() > 500 ? interval / 2 : interval
                this.__run(ms)
                break
        }
    }

    stop() {
        try {
            this.api.destroy()
        } catch (e) {
            console.log(e)
        }
        process.exit()
    }

    __run(ms = 1000) {
        setTimeout(this.__req, ms)
    }
}
