'use strict'

const { isBare } = require('which-runtime')

class Helper {
  static requirePipe () {
    return isBare ? require('..') : require('../index.default')
  }
}

module.exports = Helper
