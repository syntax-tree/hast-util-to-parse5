'use strict'

var stringify = require('json-stringify-safe')

module.exports = json

function json(value) {
  return JSON.parse(stringify(value))
}
