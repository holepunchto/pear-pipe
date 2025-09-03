'use strict'
const { isWindows, isBare, isElectronRenderer } = require('which-runtime')
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

class PearElectronPipe {
  constructor() {
    const ipc = global.Pear?.[global.Pear?.constructor.IPC]
    const pipe = ipc?.pipe()

    let autoexit = true
    const onexit = () => global.Pear.exit()

    Object.defineProperty(pipe, 'autoexit', {
      get() {
        return autoexit
      },
      set(v) {
        autoexit = v
        pipe.off('end', onexit)
        if (autoexit) pipe.once('end', onexit)
      },
      configurable: true,
      enumerable: true
    })

    pipe.autoexit = true

    return pipe
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
