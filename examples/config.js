'use strict'
const path = require('path')
const { version } = require('../package.json')

module.exports = {
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