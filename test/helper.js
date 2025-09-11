'use strict'

const { isBare } = require('which-runtime')

/**
 * Helper class to require the correct pipe module based on runtime environment
 */
class Helper {
  /**
   * Require the correct pipe module based on runtime environment
   * @returns {Function} The pipe function
   */
  static requirePipe () {
    return isBare ? require('..') : require('../index.default')
  }
}

module.exports = Helper
