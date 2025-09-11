'use strict'
const { isWindows, isBareKit } = require('which-runtime')
const fs = require('fs')
const FD = 3
const Pipe = require('bare-pipe')
class PearPipe extends Pipe {
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
module.exports = function pipe () {
  if (isBareKit) return global.BareKit.IPC
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
