### tdlnode
Telegram nodejs client https://github.com/tdlib/td

### Requirements
1. Node.js 10 preferred (minimum >= 9.0.0)
2. TDLib binary https://github.com/tdlib/td

### Getting started
- Build TDLib binary https://github.com/tdlib/td
- `npm instal tdlnode`

```js
const path = require('path')
const { Client } = require('tdlnode')

const api_id = 'your api_id'
const api_hash = 'your api_hash'
const phone_number = '+12345679021' // or token

const configuration = {
    path_to_binary_file: path.resolve(__dirname, '../lib/libtdjson'),
    database_directory: path.resolve(__dirname, '../storage'),
    files_directory: path.resolve(__dirname, '../downloads'),
    log_file_path: path.resolve(__dirname, '../logs/tdl.log'),
}

const up = async () => {
    const client = new Client({ api_id, api_hash, phone_number }, configuration)

    await client.init()

    const chats = await client.fetch({
        '@type': 'getChats',
        'offset_order': '9223372036854775807',
        'offset_chat_id': 0,
        'limit': 100,
    })

    console.log(chats)

    client.stop()
}

up()
```

### Events
```js
const callback = msg => {console.log('event', msg)}

client.on('updateOption', callback)

client.once('updateOption', callback)

client.off('updateOption', callback)
```

### Options
```js
const conf = {
    path_to_binary_file: path.resolve(__dirname, '../lib/libtdjson'), //default 'libtdjson'
    enable_storage_optimizer: true, //default true
    use_message_database: true, //default true
    use_secret_chats: false, //default false
    system_language_code: 'en', //default 'en'
    application_version: version, //default pacage.json version
    device_model: 'nodejs', //default 'nodejs'
    system_version: '10', //default 10
    database_directory: path.resolve(__dirname, '../storage'), //default './storage'
    files_directory: path.resolve(__dirname, '../downloads'), //default './downloads'
    log_file_path: path.resolve(__dirname, '../logs/tdl.log'), //default './logs/tdl.log'
    use_test_dc: true, //default false If set to true, the Telegram test environment will be used instead of the production environment. 
    verbosity_level: 10, //default 2
    fatal_error_callback: e => { console.log(e) }, //default console.log
}
```

### Getting started with telegram TDLib
- api_id and api_hash https://my.telegram.org/
- documentation https://core.telegram.org/tdlib/getting-started
- list of all available TDLib API methods https://core.telegram.org/tdlib/docs/classtd_1_1td__api_1_1_function.html

### BUILDING INSTRUCTIONS  :

to build and run TDLib binary https://github.com/tdlib/td on debian9, (Ubuntu)

1. instal dependacies
- RUN apt-get -y update
- RUN apt-get install -y g++ ccache openssl cmake gperf make git libssl-dev libreadline-dev zlib1g zlib1g-dev
- RUN mkdir build

2. WORKDIR build
- RUN cmake -DCMAKE_BUILD_TYPE=Release ..
- RUN cmake --build .

NOTE: building requires min 6gb RAM
