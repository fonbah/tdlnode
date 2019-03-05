'use strict'

module.exports = class ClientEvent {
    constructor() {
        const callBacksOn = new Map
        const callBacksOnce = new Map

        const __play = (callBacks, update) => {
            if (!callBacks.has(update['@type'])) { return }
            callBacks.get(update['@type']).forEach(callBack => {
                try {
                    callBack(update)
                } catch (e) {
                    console.log(e)
                }
            })
        }
        
        this.on = (event, callBack) => {
            if (!callBacksOn.has(event)) {
                callBacksOn.set(event, new Set([callBack]))
            } else {
                callBacksOn.get(event).add(callBack)
            }
        }
        this.once = (event, callBack) => {
            if (!callBacksOnce.has(event)) {
                callBacksOnce.set(event, new Set([callBack]))
            } else {
                callBacksOnce.get(event).add(callBack)
            }
        }
        this.off = (event, callBack) => {
            if (!callBacksOn.has(event)) { return }
            const eventCallBack = [...callBacksOn.get(event)].find(item => (item === callBack))
            callBacksOn.get(event).delete(eventCallBack)
        }
        this.play = update => {
            __play(callBacksOn, update)
            __play(callBacksOnce, update)
            if (callBacksOnce.has(update['@type'])) {
                callBacksOnce.delete(update['@type'])
            }
        }
    }
}
