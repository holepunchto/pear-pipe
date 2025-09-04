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

class API {
  static IPC = Symbol('ipc')

  constructor () {
    this[API.IPC] = {
      pipe () {
        return new Pipe(3)
      }
    }
  }

  exit () {}
}
global.Pear = new API()

// echo
const pipe = require('../..')()
pipe.on('data', (data) => pipe.write(data))
