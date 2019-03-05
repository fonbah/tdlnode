'use strict'
const ffi = require('ffi-napi')
const ref = require('ref-napi')
const { optsMerge } = require('../helper/index')
const { libDefaultOtions } = require('../conf/index')

module.exports = (options = {}) => {

    const { path_to_binary_file, verbosity_level, fatal_error_callback, log_file_path } = optsMerge(libDefaultOtions, options)

    const tdlib = ffi.Library(
        path_to_binary_file,
        {
            'td_json_client_create': ['pointer', []],
            'td_json_client_send': ['void', ['pointer', 'string']],
            'td_json_client_receive': ['string', ['pointer', 'double']],
            'td_json_client_execute': ['string', ['pointer', 'string']],
            'td_json_client_destroy': ['void', ['pointer']],
            'td_set_log_file_path': ['int', ['string']],
            'td_set_log_verbosity_level': ['void', ['int']],
            'td_set_log_fatal_error_callback': ['void', ['pointer']]
        }
    )

    tdlib.td_set_log_file_path(log_file_path)
    tdlib.td_set_log_verbosity_level(verbosity_level)
    tdlib.td_set_log_fatal_error_callback(ffi.Callback('void', ['string'], fatal_error_callback))

    const buildQuery = query => {
        const buffer = Buffer.from(JSON.stringify(query) + '\0', 'utf-8')
        buffer.type = ref.types.CString
        return buffer
    }

    return { tdlib, buildQuery }
}



