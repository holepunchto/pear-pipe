'use strict'
const program = global.Bare ?? global.process

global.Pear = {
  exit: () => {
    program.exit(1)
  }
}

const pipe = require('../..')()
pipe.on('end', () => pipe.end())
if (pipe === null) {
  program.exit(1)
}
pipe.autoexit = false
