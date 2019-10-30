'use strict'
const prompt = require('../tools/prompt')

module.exports = class ClientInput {
    constructor(init) {
        let subscription = null

        const inputs = new Map
        const inputTypes = new Set(['code', 'first_name', 'password'])

        this.getTypes = () => {
            return [...inputTypes]
        }

        this.subscribe = handler => {
            subscription = handler
            return () => {
                subscription = null
                inputs.forEach(val => val.reject)
                inputs.clear()
            }
        }

        const onInput = type => {
            if(null === subscription){
                return prompt(`${type}: `)
            }
            if(inputs.has(type)){
                inputs.get(type).reject()
            }
            const expect = new Promise((resolve, reject) => {
                inputs.set(type, { resolve, reject })
                try{
                    subscription(type, resolve)
                }catch(e){
                    console.log(e)
                    inputs.delete(type)
                    reject(e)
                }
            })
            return expect
        }

        init(onInput)
    }
}
