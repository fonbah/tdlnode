'use strict'
const err = require('./err')

const interval = 1000

module.exports = class ClientApi {
    constructor(Auth, api) {
        this.Auth = Auth
        this.api = api
        this.t = new Set
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
            if (current < 100) { return extras.size + 1 }
            return extras.size
        }

        this.__run = this.__run.bind(this)
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

    async __run() {
        try {
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
                    this.__addReq(interval / 2)
                    break
                }
                case 'error': {
                    if (update.hasOwnProperty('@extra')) {
                        this.getExtra(update['@extra']).reject(update)
                        this.delExtra(update['@extra'])
                        err(update)
                    }
                    this.__addReq(interval * 10)
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
                    const ms = this.extraSize() === 0 ? interval * 10 : this.extraSize() > 10 ? interval / 2 : interval
                    this.__addReq(ms)
                    break
            }
        } catch (e) {
            console.log(e)
            this.stop()
        }
    }

    stop() {
        try {
            this.t.forEach(k => { clearTimeout(k) })
            this.t.clear()
            this.api.destroy()
            console.log('Client succesfully stoped.')
        } catch (e) {
            console.log(e)
        }
        return null
    }

    __addReq(ms = 1000) {
        this.t.add(setTimeout(this.__run, ms))
        if (this.t.size > 100) {
            const itemsDel = [...this.t].slice(0, this.t.size / 2)
            itemsDel.forEach(item => {
                this.t.delete(item)
                clearTimeout(item)
            })
        }
    }
}







