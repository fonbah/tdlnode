'use strict'
module.exports = {
    path_to_binary_file: 'libtdjson',
    verbosity_level: 2,
    fatal_error_callback: e => { console.log(e) },
    log_file_path: './logs/tdlib.log',
}