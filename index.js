'use strict'
const { isWindows, isBare, isElectronRenderer } = require('which-runtime')
const { Duplex } = require('streamx')
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

class PearElectronPipe extends Duplex {
  #pipe
  #autoexit = true
  #onexit = () => global.Pear.exit()

  constructor () {
    super()

    const ipc = global.Pear?.[global.Pear?.constructor.IPC]
    this.#pipe = ipc.pipe()

    this.#pipe.once('error', (err) => this.destroy(err))
    this.#pipe.once('finish', () => this.end())
    this.#pipe.once('close', () => this.destroy())
    this.#pipe.once('end', () => this.push(null))

    this.#pipe.on('data', (data) => this.push(data))

    this.autoexit = true
  }

  _write (data, cb) { return this.#pipe.write(data, cb) }

  get autoexit () { return this.#autoexit }

  set autoexit (v) {
    this.#autoexit = v
    this.#pipe.off('end', this.#onexit)
    if (this.#autoexit) this.#pipe.once('end', this.#onexit)
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
