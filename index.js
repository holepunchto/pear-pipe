'use strict'
const { isWindows, isBareKit } = require('which-runtime')
const fs = require('fs')
const FD = 3
class PearPipe extends require('bare-pipe') {
  #onexit () { global.Pear.exit() }

  #autoexit = true

  get autoexit () { return this.#autoexit }

  set autoexit (v) {
    this.#autoexit = v
    this.off('end', this.#onexit)
    if (this.#autoexit) this.once('end', this.#onexit)
  }

  constructor () {
    super(FD)
    this.autoexit = true
  }
}

if (isBareKit) exports.args = [...global.Bare.argv]

let PIPE = null
module.exports = isBareKit
  ? () => global.BareKit.IPC
  : function pipe () {
    if (PIPE !== null) return PIPE
    let attached
    try {
      attached = isWindows ? !!fs.fstatSync(FD) : fs.fstatSync(FD).isSocket()
    } catch {
      attached = false
    }
    if (attached === false) return null
    PIPE = new PearPipe()
    return PIPE
  }
