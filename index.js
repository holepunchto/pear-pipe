'use strict'
const {
  isWindows,
  isElectronRenderer,
  isBareKit,
  isPear
} = require('which-runtime')
const { Duplex } = require('streamx')
const Pipe = require('#pipe')
const fs = require('fs')
const FD = 3

class PearPipe extends Pipe {
  #onexit() {
    global.Pear.exit()
  }

  #autoexit = true

  get autoexit() {
    return this.#autoexit
  }

  set autoexit(v) {
    this.#autoexit = v
    this.off('end', this.#onexit)
    if (this.#autoexit) this.once('end', this.#onexit)
  }

  constructor() {
    super(FD)
    this.autoexit = true
  }
}

class PearElectronPipe extends Duplex {
  #pipe
  #autoexit = true
  #onexit = () => global.Pear.exit()

  constructor() {
    super()

    const ipc = global.Pear?.[global.Pear?.constructor.IPC]
    this.#pipe = ipc.pipe()

    this.#pipe.once('error', (err) => this.destroy(err))
    this.#pipe.once('finish', () => this.end())
    this.#pipe.once('end', () => this.push(null))
    this.#pipe.on('data', (data) => this.push(data))
    this.#pipe.on('drain', this._ondrain.bind(this))
    this._continueWrite = null

    this.autoexit = true
  }

  _ondrain() {
    const cb = this._continueWrite
    this._continueWrite = null
    cb(null)
  }

  _write(data, cb) {
    if (!this.#pipe.write(data)) this._continueWrite = cb
    else cb(null)
  }

  _predestroy() {
    this._ondrain()
    this.#pipe.destroy(new Error('Stream destroyed'))
  }

  _final(cb) {
    this.#pipe.end()
    cb(null)
  }

  get autoexit() {
    return this.#autoexit
  }

  set autoexit(v) {
    this.#autoexit = v
    this.#pipe.off('end', this.#onexit)
    if (this.#autoexit) this.#pipe.once('end', this.#onexit)
  }
}

class ThreadPipe {
  // TODO: add autoexit
  #readPipe
  #writePipe

  constructor() {
    const data = global.Bare?.Thread?.self?.data ?? null
    if (data === null)
      throw new Error('Bare thread data should hold FDs for pipe construction')
    this.#readPipe = new Pipe(data._readFd)
    this.#writePipe = new Pipe(data._writeFd)
  }

  on(event, callback) {
    return this.#readPipe.on(event, callback)
  }

  write(data) {
    return this.#writePipe.write(data)
  }

  // is this correct?
  destroy() {
    this.#readPipe.destroy()
    this.#writePipe.destroy()
  }

  end() {
    this.#writePipe.end()
    this.#readPipe.end()
  }
}

if (isBareKit) exports.args = [...global.Bare?.argv]
else if (!isPear) exports.args = global.Bare?.argv.slice(2)

let PIPE = !isPear ? (global.BareKit?.IPC ?? new ThreadPipe()) : null // TODO: need different check when we add Pear global to mobile
module.exports = function pipe() {
  if (PIPE !== null) return PIPE
  let attached
  try {
    attached = isWindows ? !!fs.fstatSync(FD) : fs.fstatSync(FD).isSocket()
  } catch {
    attached = false
  }
  if (!!global?.process?.channel) return // spawned by Node.js with stdio ipc set on stdio[3]
  if (attached === false && !isElectronRenderer) return null
  PIPE = isElectronRenderer ? new PearElectronPipe() : new PearPipe()
  return PIPE
}
