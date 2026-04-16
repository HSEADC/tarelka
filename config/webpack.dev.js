const path = require('path')
const common = require('./webpack.common.js')
const { merge } = require('webpack-merge')

module.exports = merge(common, {
  mode: 'development',
  output: {
    path: path.resolve('.', 'dev-build')
  },
  devServer: {
    static: './dev-build'
  },
  devtool: 'inline-source-map'
})
