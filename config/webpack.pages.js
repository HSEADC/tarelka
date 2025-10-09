const HtmlWebpackPlugin = require('html-webpack-plugin');

function createPage(template, filename) {
  return new HtmlWebpackPlugin({
    template: template,
    filename: filename,
  });
}

const htmlPages = [
  createPage('./src/index.html', './index.html'),
  createPage('./src/pages/articles.html', './pages/articles.html'),
  createPage(
    './src/pages/articles/article1.html',
    './pages/articles/article1.html'
  ),
  createPage(
    './src/pages/articles/article2.html',
    './pages/articles/article2.html'
  ),
  createPage(
    './src/pages/articles/article3.html',
    './pages/articles/article3.html'
  ),
  createPage(
    './src/pages/articles/article4.html',
    './pages/articles/article4.html'
  ),
  createPage('./src/pages/tarelka.html', './pages/tarelka.html'),
  createPage('./src/pages/search.html', './pages/search.html'),
];

module.exports = htmlPages;
