'use strict'
const pipe = require('../..')()

pipe.on('data', (data) => pipe.write(data))
