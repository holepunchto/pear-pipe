'use strict'
const { isWindows } = require('which-runtime')
const BarePipe = require('bare-pipe')
const fs = require('fs')
const FD = 3
class PearPipe extends BarePipe {
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

let PIPE = null
module.exports = function pipe () {
  if (PIPE !== null) return PIPE
  const attached = isWindows ? fs.fstatSync(FD).isFIFO() : fs.fstatSync(FD).isSocket()
  if (attached === false) return null
  PIPE = new PearPipe()
  return PIPE
}
