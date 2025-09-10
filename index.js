const { isBareKit, isPear, isMobile, isBare, isNode } = require('which-runtime')

if (isBareKit || isMobile) {
  module.exports = require('./lib/bare-kit')
}
else if (isPear || isBare || isNode) {
  module.exports = require('./lib/pear')
}
