'use strict'

const verificationCodeHandler = resolve => {
    const code = 'get somehow your code here'
    resolve(code)
}

const inputHandler = (type, resolve) => {
    switch (type) {
        case 'code':
            verificationCodeHandler(resolve)
            break
        case 'first_name':
            resolve('your first name')
            break
        case 'password':
            resolve('your password')
            break
    }
}

module.exports = inputHandler