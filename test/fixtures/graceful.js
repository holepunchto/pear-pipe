'use strict'
global.Pear = { exit: () => { global.Bare.exit(1) } }

const pipe = require('../..')()
pipe.on('end', () => pipe.end())
if (pipe === null) {
  global.Bare.exit(1)
}
pipe.autoexit = false
