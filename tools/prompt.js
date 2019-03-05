'use strict'
const readline = require('readline')

module.exports = hint => {
    return new Promise((resolve, reject) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        })
        rl.question(hint, input => {
            rl.close()
            resolve(input)
        })
    }).catch(console.log)
}