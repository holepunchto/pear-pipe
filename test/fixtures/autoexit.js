'use strict'
global.Pear = { exit: () => { global.Bare.exit(0) } }

const pipe = require('../..')()
if (pipe === null) {
  global.Bare.exit(1)
}
