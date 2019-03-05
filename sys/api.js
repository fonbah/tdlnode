'use strict'

module.exports = (tdlib, buildQuery) => {
    const client = tdlib.td_json_client_create()
    const execute = query => {
        return JSON.parse(
            tdlib.td_json_client_execute(client, buildQuery(query))
        )
    }
    const send = query => {
        tdlib.td_json_client_send(client, buildQuery(query))
    }
    const receive = (timeout = 10) => {
        return JSON.parse(
            tdlib.td_json_client_receive(client, timeout)
        )
    }
    const destroy = () => {
        tdlib.td_json_client_destroy(client)
    }
    return {
        execute,
        send,
        receive,
        destroy,
    }
}