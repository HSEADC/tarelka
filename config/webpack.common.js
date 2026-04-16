const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const htmlPages = require('./webpack.pages.js')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: {
    index: './src/javascripts/index.js',
    test1: './src/javascripts/test1.js',
    test2: './src/javascripts/test2.js',
    basic: './src/javascripts/basic.js'
  },
  output: {
    path: path.resolve('.', 'docs'),
    filename: '[name].js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.html$/i,
        exclude: /src\/(index|pages)/, // исключаем страницы
        loader: 'html-loader'
      },
      {
        test: /\.css$/i,
        exclude: /node_modules/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(js|jsx)$/i,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.(png|jpg|jpeg|svg|webp|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name][ext][query]'
        }
      },
      {
        test: /\.(ttf|otf|woff|woff2)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[hash][ext][query]'
        }
      }
    ]
  },
  plugins: [
    ...htmlPages,
    new MiniCssExtractPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../src/img/'),
          to: path.resolve(__dirname, '../dev-build/img/')
        },
        {
          from: path.resolve(__dirname, '../src/img/'),
          to: path.resolve(__dirname, '../docs/img/')
        }
      ]
    })
  ],
  optimization: {
    runtimeChunk: 'single'
  }
}
