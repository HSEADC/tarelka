const HtmlWebpackPlugin = require('html-webpack-plugin');

function createPage(template, filename, chunks) {
  return new HtmlWebpackPlugin({
    template: template,
    filename: filename,
    chunks: chunks,
  });
}

const htmlPages = [
  createPage('./src/index1.html', './index1.html', ['index', 'basic']),
  createPage('./src/index.html', 'index.html', ['index', 'basic']),
  createPage('./src/pages/articles.html', './pages/articles.html', [
    'index',
    'basic',
  ]),
  
  createPage(
    './src/pages/articles/article1.html',
    './pages/articles/article1.html',
    ['index', 'basic'],
  ),
  createPage(
    './src/pages/articles/article2.html',
    './pages/articles/article2.html',
    ['index', 'basic'],
  ),
  createPage(
    './src/pages/articles/article3.html',
    './pages/articles/article3.html',
    ['index', 'basic'],
  ),
  createPage(
    './src/pages/articles/article4.html',
    './pages/articles/article4.html',
    ['index', 'basic'],
  ),
  createPage(
    './src/pages/reactbasics.html',
    './pages/reactbasics.html',
    ['reactbasics', 'basic'],
  ),

  createPage('./src/pages/recepies.html', './pages/recepies.html', [
    'index',
    'basic',
    'filterTags'
  ]),

    createPage(
    './src/pages/recepies/recipe1.html',
    './pages/recepies/recipe1.html',
    ['index', 'basic'],
  ),

  createPage('./src/pages/tests.html', './pages/tests.html', [
    'index',
    'basic',
    
  ]),
  createPage('./src/pages/tests/test1.html', './pages/tests/test1.html', [
    'test1',
    'basic',
  ]),
  createPage('./src/pages/tests/test2.html', './pages/tests/test2.html', [
    'test2',
    'basic',
  ]),
];

module.exports = htmlPages;
