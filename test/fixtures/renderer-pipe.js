// Fake an Electron renderer process
global.process = {
  ...global.process,
  versions: {
    ...global.process?.versions,
    electron: '27.0.0'
  },
  type: 'renderer'
}

// Mock the electron renderer ipc.pipe()
const { isBare } = require('which-runtime')
const Pipe = isBare
  ? require('bare-pipe')
  : class Pipe extends require('net').Socket { constructor (fd) { super({ fd }) } }

const pipeMock = new Pipe(3)

if (!global.Pear) global.Pear = {}
if (!global.Pear.constructor) global.Pear.constructor = {}
if (!global.Pear.constructor.IPC) global.Pear.constructor.IPC = Symbol('ipc')
if (!global.Pear.exit) global.Pear.exit = () => pipeMock.destroy()

global.Pear[global.Pear.constructor.IPC] = {
  pipe () {
    return pipeMock
  }
}

const pipe = require('../..')()

// echo
pipe.on('data', (data) => pipe.write(data))
