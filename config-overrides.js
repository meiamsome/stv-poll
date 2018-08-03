const rewireEslint = require('react-app-rewire-eslint')
const {
  injectBabelPlugin,
} = require('react-app-rewired')

module.exports = function override(config, env) {
  config = injectBabelPlugin('@babel/plugin-proposal-optional-chaining',config)
  config = rewireEslint(config, env)
  return config
}
