const path = require('path')
const common = require('./webpack.common.js')
const { merge } = require('webpack-merge')

module.exports = merge(common, {
  mode: 'development',
  output: {
    path: path.resolve('.', 'docs')
  },
  devServer: {
    static: './dev_build'
  },
  devtool: 'inline-source-map'
})
