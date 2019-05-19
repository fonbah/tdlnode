'use strict'
const { Client } = require('tdlnode')
const configExample = require('./config')

const api_id = 'your api_id'
const api_hash = 'your api_hash'
const phone_number = '+12345679021' // or token


const up = async () => {

    const client = new Client({ api_id, api_hash, phone_number }, configExample)
    
    client.on('error', update => {
        console.log('CLIENT ERROR CALLBACK', update)
    })

    const state = new Map

    const defaultAction = (name, value) => {
        state.set(name, value)
    }

    const chatAction = chat => {
        const { id, title, unread_count, last_read_inbox_message_id, last_read_outbox_message_id } = chat
        state.set(id, { title, unread_count, last_read_inbox_message_id, last_read_outbox_message_id, messages: new Set })
    }

    const chatOrderAction = update => {
        const { chat_id, order } = update
        state.set(chat_id, { ...state.get(chat_id), order })
    }

    const messageAction = (chat_id, message) => {
        state.get(chat_id).messages.add(message)
    }

    const chatHistoryAction = async (chat_id, fromMsgId) => {
        const chatHistory = await client.fetch({
            '@type': 'getChatHistory',
            'chat_id': chat_id,
            'from_message_id': fromMsgId,
            'offset': 0,
            'limit': 100,
        })
        chatHistory.messages.forEach(message => messageAction(chat_id, message))
    }

    client.on('updateOption', update => {
        if (update.name === 'my_id') {
            if (state.has(update.name)) {
                state.clear()
            }
            defaultAction(update.name, update.value.value)
        }
    })

    client.on('updateChatOrder', update => {
        chatOrderAction(update)
    })

    client.on('updateUnreadMessageCount', update => {
        const { unread_count } = update
        defaultAction('updateUnreadMessageCount', unread_count)
    })

    client.on('updateUnreadChatCount', update => {
        const { unread_count } = update
        defaultAction('updateUnreadChatCount', unread_count)
    })

    client.on('updateNewChat', update => {
        chatAction(update.chat)
    })

    client.on('updateChatLastMessage', update => {
        const { chat_id, last_message } = update
        messageAction(chat_id, last_message)
    })

    await client.init()

    const chats = await client.fetch({
        '@type': 'getChats',
        'offset_order': '9223372036854775807',
        'offset_chat_id': 0,
        'limit': 100,
    })

    console.log('chats', chats)

    const chatsHistoryArgs = [...state.keys()]
        .filter(key => (Number.isInteger(key)))
        .map(chat_id => { return [chat_id, [...state.get(chat_id).messages][0].id] })

    await Promise.all(chatsHistoryArgs.map(args => chatHistoryAction(...args)))

    console.log(state)

    client.stop()
}

up()