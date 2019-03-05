'use strict'
const prompt = require('../tools/prompt')

class Auth {
  constructor(credentials, options) {
    let inited = null
    this.credentials = credentials
    this.options = options

    this.__started = () => {
      return null !== inited
    }

    this.__initStart = resolver => {
      if (null !== inited) {
        console.log('Client has been inited already')
        return null
      }
      inited = resolver
    }

    this.__initResolve = result => {
      if (inited.hasOwnProperty('resolve')) {
        return inited.resolve(result)
      }
      return Promise.reject(null)
    }

  }

  async buildQuery(update) {
    switch (update['authorization_state']['@type']) {
      case 'authorizationStateWaitTdlibParameters': {
        const { api_id, api_hash } = this.credentials
        return {
          '@type': 'setTdlibParameters',
          'parameters': {
            ...this.options,
            api_id,
            api_hash,
          },
        }
        break
      }
      case 'authorizationStateWaitEncryptionKey': {
        return { '@type': 'checkDatabaseEncryptionKey' }
        break
      }
      case 'authorizationStateWaitPhoneNumber': {
        const { phone_number, token } = this.credentials
        console.log(`Authorizing ${phone_number ? phone_number : token}`)
        if (phone_number) {
          return {
            '@type': 'setAuthenticationPhoneNumber',
            phone_number,
          }
        } else {
          return {
            '@type': 'checkAuthenticationBotToken',
            token, //bot token
          }
        }
        break
      }
      case 'authorizationStateWaitCode': {
        const { phone_number } = this.credentials
        const authObj = { '@type': 'checkAuthenticationCode' }
        if (!update['authorization_state']['is_registered']) {
          console.log(`User ${phone_number} has not yet been registered yet...`)
          authObj['first_name'] = await prompt('first_name: ')
        }
        authObj['code'] = await prompt('code: ')
        return authObj
        break
      }
      case 'authorizationStateWaitPassword': {
        const password = await prompt('password: ')
        return {
          '@type': 'checkAuthenticationPassword',
          password,
        }
        break
      }
      case 'authorizationStateReady':
        this.__initResolve(update)
        return true
    }
  }
}

module.exports = Auth