'use strict'
const { isWindows, isBareKit, isPear, isMobile } = require('which-runtime')
const fs = require('fs')
const FD = 3
const Pipe = require('bare-pipe')

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
    const data = global.Bare.Thread.self.data
    this.#readPipe = new Pipe(data.readFd)
    this.#writePipe = new Pipe(data.writeFd)
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

let PIPE = (isMobile && !isReactNative) ? new ThreadPipe() : global.BareKit?.IPC ?? null
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
