'use strict'
const ClientEvent = require('./ClientEvent')
const err = require('./err')

const session = [Date.now(), process.pid].join('-')

const interval = 5, sleepInterval = 2000

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
            const uid = [session, ++current].join('-')
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
            //console.log(`No updates ${update},  sleep for ${sleepInterval}ms`)
            this.__run(sleepInterval)
            return
        }

        switch (update['@type']) {
            case 'updateAuthorizationState': {
                const authObj = await this.Auth.buildQuery(update).catch(console.log)
                this.api.send(authObj)
                this.__run()
                break
            }
            case 'error': {
                if (update.hasOwnProperty('@extra')) {
                    this.getExtra(update['@extra']).reject(update)
                    this.delExtra(update['@extra'])
                    err(update)
                }
                console.log(`Updates ERROR ${update},  sleep for ${sleepInterval}ms`)
                this.__run(sleepInterval)
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
                this.__run()
                break
        }
    }

    stop() {
        try {
            this.api.destroy()
            console.log('Client successfully stopped!')
        } catch (e) {
            console.log(e)
        }
        process.exit()
    }

    __run(ms = interval) {
        setTimeout(this.__req, ms)
    }
}
