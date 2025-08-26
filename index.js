'use strict'
const { isWindows, isBare } = require('which-runtime')
const Pipe = isBare
  ? require('bare-pipe')
  : class Pipe extends require('net').Socket { constructor (fd) { super({ fd }) } }
const fs = require('fs')
const FD = 3
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

let PIPE = null
module.exports = function pipe () {
  if (PIPE !== null) return PIPE
  let attached
  try{
    attached = isWindows ? fs.fstatSync(FD).isFIFO() : fs.fstatSync(FD).isSocket()
  } catch{
    attached = false
  }
  if (attached === false) return null
  PIPE = new PearPipe()
  return PIPE
}
