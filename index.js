const { isBareKit, isPear, isMobile } = require('which-runtime')

if (isPear) {
  module.exports = require('./lib/pear')
} else if (isBareKit || isMobile) {
  module.exports = require('./lib/bare-kit')
}