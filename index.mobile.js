'use strict'
const { isBareKit } = require('which-runtime')
const { parentPort } = require('bare-worker')
const b4a = require('b4a')

if (isBareKit) exports.args = [...global.Bare?.argv]
else exports.args = global.Bare?.argv.slice(2)

let PIPE = global.BareKit?.IPC ?? null
module.exports = function pipe() {
  if (PIPE !== null) return PIPE
  parentPort.write = (message) => parentPort.postMessage(b4a.from(message))
  parentPort.on('message', (data) => parentPort.emit('data', data))
  PIPE = parentPort
  return PIPE
}
