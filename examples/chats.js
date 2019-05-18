'use strict'
const { Client } = require('tdlnode')
const configExample = require('./config')

const api_id = 'your api_id'
const api_hash = 'your api_hash'
const phone_number = '+12345679021' // or token


const up = async () => {
    const client = new Client({ api_id, api_hash, phone_number }, configExample)

    const clb = msg => {console.log('event', msg)}

    client.on('chats', clb)

    client.once('chats', clb)
    
    await client.init()

    await client.fetch({
        '@type': 'getChats',
        'offset_order': '9223372036854775807',
        'offset_chat_id': 0,
        'limit': 100,
    })

    client.off('chats', clb)

    const chats = await client.fetch({
        '@type': 'getChats',
        'offset_order': '9223372036854775807',
        'offset_chat_id': 0,
        'limit': 100,
    })

    console.log('chats', chats)

    client.stop()
}

up()