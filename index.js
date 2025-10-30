'use strict'
const { isWindows, isBareKit, isPear, isIOS, isAndroid, isReactNative, isExpo } = require('which-runtime')
const fs = require('fs')
const FD = 3
const Pipe = require('bare-pipe')
const isMobile = isIOS || isAndroid || isReactNative || isExpo

class PearPipe extends Pipe {
  #onexit () { isPear && global.Pear.exit() }

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

class ThreadPipe {
  // TODO: add autoexit
  #readPipe
  #writePipe
  
  constructor () {
    const data = global.Bare?.Thread?.self?.data ?? null
    if (data === null) throw new Error('Bare thread data should hold FDs')
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

if (isBareKit) exports.args = [...Bare.argv]
else if (!isPear) exports.args = Bare.argv.slice(2)

let PIPE = isMobile ? global.BareKit?.IPC ?? new ThreadPipe() : null
module.exports = function pipe () {
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
