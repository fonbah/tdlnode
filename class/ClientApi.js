'use strict'
const ClientEvent = require('./ClientEvent')

const interval = 5, sleepInterval = 2000

module.exports = class ClientApi {
    constructor(Auth, api) {

        this.Auth = Auth
        this.api = api

        this.ClientEvent = new ClientEvent

        const session = [Date.now(), process.pid].join('-')
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
            return Promise.reject('Client inited already')
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
            this.__run(sleepInterval)
            return
        }

        switch (update['@type']) {
            case 'updateAuthorizationState': {
                const authObj = await this.Auth.buildQuery(update)
                if (this.Auth.__started()) {
                    this.api.send(authObj)
                    this.__run()
                } else { console.log('authorization closed!') }
                break
            }
            case 'error': {
                if (update.hasOwnProperty('@extra')) {
                    this.__getExtra(update['@extra']).reject(update)
                    this.__delExtra(update['@extra'])
                }
                await this.__handleUpdateError(update)
                break
            }
            default:
                if (update.hasOwnProperty('@extra')) {
                    this.__getExtra(update['@extra']).resolve(update)
                    this.__delExtra(update['@extra'])
                }
                this.ClientEvent.play(update)
                this.__run()
                break
        }
    }

    async __handleUpdateError(update) {
        switch (update['message']) {
            case 'PHONE_CODE_EMPTY':
            case 'PHONE_CODE_INVALID': {
                const authObj = await this.Auth.buildCodeQuery()
                this.api.send(authObj)
                this.__run()
                break
            }
            case 'PASSWORD_HASH_INVALID': {
                const authObj = await this.Auth.buildPassQuery()
                this.api.send(authObj)
                this.__run()
            }
            case 'ACCESS_TOKEN_INVALID': {
                console.log('Unknown access token!')
                this.stop()
            }
            default:
                this.ClientEvent.play(update)
                this.__run(sleepInterval)
        }
    }

    stop() {
        this.api.destroy()
        console.log('Client successfully stopped!')
        process.exit()
    }

    __run(ms = interval) {
        setTimeout(this.__req, ms)
    }
}
