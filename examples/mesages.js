'use strict'
const { Client } = require('../index')
const configExample = require('./config')

const api_id = 'your api_id'
const api_hash = 'your api_hash'
const phone_number = '+12345679021' // or token

const up = async () => {
    const client = new Client({ api_id, api_hash, phone_number }, configExample)

    await client.init()

    const unreadMessages = await client.fetch({
        '@type': 'getChatHistory',
        'chat_id': '777000', //your chat_id
        'from_message_id': 0,
        'offset': 0,
        'limit': 100,
    })

    //Send message
    const sendMesage = await client.fetch({
        '@type': 'sendMessage',
        'chat_id': '', //your chat_id
        'input_message_content': {
            '@type': 'inputMessageText',
            'text': {
                '@type': 'formattedText',
                'text': 'Nodegram test message!',
            },
        },
        'reply_to_message_id': '', //msg id
    })

    const viewMessages = await client.fetch({
        '@type': 'viewMessages',
        'chat_id': '777000', //your chat_id
        'message_ids': [''], // array of message_id
        'force_read': true, //mark as read
    })

    const deleteMessages = await client.fetch({
        '@type': 'deleteMessages',
        'chat_id': '', //your chat_id
        'message_ids': [''], // array of message_id
        'revoke': true, // for all users
    })

    console.log(
        'unreadMessages', unreadMessages,
        'sendMesage', sendMesage,
        'viewMessages', viewMessages,
        'deleteMessages', deleteMessages
    )

    //Subscribe to events
    const clb = msg => { console.log('event', msg) }

    client.on('messages', clb)

    client.on('message', clb)

    client.stop()
}

up()