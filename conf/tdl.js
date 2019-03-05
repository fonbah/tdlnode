'use strict'
const { version } = require('../package.json')

module.exports = {
    'enable_storage_optimizer': true,
    'use_message_database': true,
    'use_secret_chats': false,
    'system_language_code': 'en',
    'application_version': version,
    'device_model': 'nodejs',
    'system_version': '10',
}