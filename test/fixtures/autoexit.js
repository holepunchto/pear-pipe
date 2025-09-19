'use strict'
const program = global.Bare ?? global.process
global.Pear = {
  exit: () => {
    program.exit(0)
  }
}

const pipe = require('../..')()
if (pipe === null) {
  program.exit(1)
}
