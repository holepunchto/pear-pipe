'use strict'
const { isWindows, isBare, isElectronRenderer } = require('which-runtime')
const Stream = require('streamx')
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

class PearElectronPipe extends Stream.Duplex {
  #pipe
  #autoexit = true
  #onexit = () => global.Pear.exit()

  constructor () {
    super()

    const ipc = global.Pear?.[global.Pear?.constructor.IPC]
    this.#pipe = ipc.pipe()

    this.#pipe.on('error', (err) => this.destroy(err))
    this.#pipe.on('finish', () => this.end())
    this.#pipe.on('close', () => this.destroy())
    this.#pipe.on('end', () => this.push(null))

    this.#pipe.on('data', (chunk) => this.push(chunk))

    this.autoexit = true
  }

  _write (chunk, callback) {
    this.#pipe._write(chunk, callback)
  }

  get autoexit () { return this.#autoexit }
  set autoexit (v) {
    this.#autoexit = v
    this.#pipe.off('end', this.#onexit)
    if (v) this.#pipe.once('end', this.#onexit)
  }
}

let PIPE = null
module.exports = function pipe () {
  if (PIPE !== null) return PIPE
  let attached
  try {
    attached = isWindows ? !!fs.fstatSync(FD) : fs.fstatSync(FD).isSocket()
  } catch {
    attached = false
  }
  if (attached === false && !isElectronRenderer) return null
  PIPE = isElectronRenderer ? new PearElectronPipe() : new PearPipe()
  return PIPE
}
