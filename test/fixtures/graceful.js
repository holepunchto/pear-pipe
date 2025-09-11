'use strict'
const program = global.Bare ?? global.process

global.Pear = { exit: () => { program.exit(1) } }

const pipe = require('../helper').requirePipe()()
pipe.on('end', () => program.exit(1))
if (pipe === null) {
  program.exit(1)
}
pipe.autoexit = false
