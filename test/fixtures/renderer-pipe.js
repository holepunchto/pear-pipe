// Fake an Electron renderer process
global.process = {
  ...global.process,
  versions: {
    ...global.process?.versions,
    electron: '27.0.0'
  },
  type: 'renderer'
};

// Mock the electron renderer ipc.pipe()
delete require.cache[require.resolve('which-runtime')];
const { isBare } = require('which-runtime');
const Pipe = isBare
  ? require('bare-pipe')
  : class Pipe extends require('net').Socket { constructor (fd) { super({ fd }) } }

const pipe = new Pipe (3)

if (!global.Pear) global.Pear = {}
if (!global.Pear.constructor) global.Pear.constructor = {}
if (!global.Pear.constructor.IPC) global.Pear.constructor.IPC = Symbol('ipc')

global.Pear[global.Pear?.constructor.IPC] = {
    pipe (){
        return pipe
    }
}

//echo
pipe.on('data', (data) => pipe.write(data))
