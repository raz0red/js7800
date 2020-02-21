const path = require('path');

module.exports = {
  entry: [
    path.resolve(__dirname, 'src/js/js7800.js')
  ],
  output: {
    filename: 'js7800-bundle.js',
    path: path.resolve(__dirname, 'src/js'),
  }  
};

