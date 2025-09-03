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

let PIPE = null
module.exports = function pipe () {
  if (PIPE !== null) return PIPE
  if (isElectronRenderer) return getRendererPipe()
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

function getRendererPipe () {
  const pipe = global.Pear?.[global.Pear?.constructor.IPC].pipe()
  if (!pipe){
    console.warn('electron rendere pipe not supported by pear v1')
    return null
  }
  let autoexit = true
  const onexit = () => global.Pear.exit()
  Object.defineProperty(pipe, 'autoexit', {
    get () { return autoexit },
    set (v) {
      autoexit = v
      pipe.off('end', onexit)
      if (autoexit) pipe.once('end', onexit)
    },
    configurable: true
  })
  return pipe
}
