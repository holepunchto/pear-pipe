'use strict'
exports.args = [...global.Bare.argv]

module.exports = function stream () {
  return global.BareKit.IPC
}
