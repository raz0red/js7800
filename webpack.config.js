const path = require('path');

module.exports = {
  entry: [
    path.resolve(__dirname, 'src/js/index.js')
  ],
  output: {
    filename: 'js7800-bundle.js',
    path: path.resolve(__dirname, 'src/js'),
    library: 'js7800',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jp(e*)g|svg|gif)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8000, // Convert images < 8kb to base64 strings
            name: 'images/[hash]-[name].[ext]'
          }
        }]
      }
    ],
  },
};
