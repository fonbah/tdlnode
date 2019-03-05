### Requirements

1. Node.js 10 preferred (minimum >= 9.0.0)
2. Compile TDLib binary https://github.com/tdlib/td

3. Get credentials api_id, api_hash at https://my.telegram.org
4. Create configuration object

```js
const path = require('path')
const { version } = require('../package.json')
const { Client } = require('../index')

const api_id = 'your api_id'
const api_hash = 'your api_hash'
const phone_number = '+12345679021' // or token

const conf = {
    path_to_binary_file: path.resolve(__dirname, '../lib/libtdjson'),
    enable_storage_optimizer: true,
    use_message_database: true,
    use_secret_chats: false,
    system_language_code: 'en',
    application_version: version,
    device_model: 'nodejs',
    system_version: '10',
    database_directory: path.resolve(__dirname, '../storage'),
    files_directory: path.resolve(__dirname, '../downloads'),
    log_file_path: path.resolve(__dirname, '../logs/tdl.log'),
    use_test_dc: true, //If set to true, the Telegram test environment will be used instead of the production environment. 
    verbosity_level: 10,
    fatal_error_callback: e => { console.log(e) },
}

const up = async () => {
    const client = new Client({ api_id, api_hash, phone_number }, conf)

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

tdlnode is a nodejs binding over tdlib binary https://github.com/tdlib/td

### BUILDING INSTRUCTIONS  :

FROM debian:9

- RUN apt-get -y update
- RUN apt-get install -y g++ ccache openssl cmake gperf make git libssl-dev libreadline-dev zlib1g zlib1g-dev
- RUN mkdir build
- WORKDIR build
- RUN cmake -DCMAKE_BUILD_TYPE=Release ..
- RUN cmake --build .
