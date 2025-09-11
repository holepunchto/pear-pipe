'use strict'
const pipe = require('../helper').requirePipe()()

pipe.on('data', (data) => pipe.write(data))
