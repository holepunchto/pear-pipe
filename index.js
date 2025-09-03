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
  #autoexit = true

  get autoexit() { return this.#autoexit }

  constructor() {
    const ipc = global.Pear?.[global.Pear?.constructor.IPC] ?? global.Pear?.[Symbol.for('pear.ipc')]
    const pipe = ipc?.pipe ? ipc.pipe() : global.Pear.worker.pipe()

    pipe.autoexit = true
    const onexit = () => global.Pear.exit()
    Object.defineProperty(pipe, 'setAutoexit', {
      value: (v) => {
        pipe.off('end', onexit)
        if (v) pipe.once('end', onexit)
        pipe.autoexit = v
      }
    })

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
