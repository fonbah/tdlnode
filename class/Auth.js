'use strict'
const ClientInput = require('./ClientInput')

class Auth {
  constructor(credentials, options) {
    let inited = null

    this.credentials = credentials
    this.options = options

    this.__clientInput
    this.clientInput = new ClientInput(onInput => { this.__clientInput = onInput })

    this.__started = () => {
      return null !== inited
    }

    this.__initStart = resolver => {
      if (null !== inited) {
        console.log('Client inited already')
        return null
      }
      inited = resolver
    }

    this.__initResolve = result => {
      return inited.resolve(result)
    }

    this.__initClose = () => {
      inited = null
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
          authObj['first_name'] = await this.__clientInput('first_name')
        }
        authObj['code'] = await this.__clientInput('code')
        return authObj
        break
      }
      case 'authorizationStateWaitPassword': {
        const query = await this.buildPassQuery()
        return query
        break
      }
      case 'authorizationStateClosed':
        this.__initClose()
        break
      case 'authorizationStateReady':
        this.__initResolve(update)
        return true
    }
  }

  async buildCodeQuery() {
    const code = await this.__clientInput('code')
    return {
      '@type': 'checkAuthenticationCode',
      code,
    }
  }

  async buildPassQuery() {
    const password = await this.__clientInput('password')
    return {
      '@type': 'checkAuthenticationPassword',
      password,
    }
  }
}

module.exports = Auth