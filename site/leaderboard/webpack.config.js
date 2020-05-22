const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');
const fs = require('fs');

module.exports = {
  entry: {
    "leaderboard.min": "./site/leaderboard/src/js/leaderboard.js"
  },
  devtool: "source-map",
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    library: 'leaderboard',
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
        test: /\.(rom)$/i,
        use: [
          {
            loader: 'url-loader',
          },
        ],
      },
      {
        test: /\.(png|jp(e*)g|svg|gif)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8192, // Convert images < 8kb to base64 strings
            name: 'images/[hash]-[name].[ext]'
          }
        }]
      }
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        test: /\.min\.js$/
      }),
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'deploy'),
    publicPath: '/js/',
    compress: true,
    port: 8000
  },
  plugins: [
    {
      apply: compiler => {
        compiler.hooks.afterEmit.tap('AfterEmitPlugin', () => {
          let src = path.resolve(__dirname, 'dist/leaderboard.min.js');
          let dst = path.resolve(__dirname, '../deploy/leaderboard/js/leaderboard.min.js');
          fs.copyFile(src, dst,
            err => {
              if (!err) {
                console.log("Copied to leaderboard: " + src);
              } else {
                throw "Failed copy to leaderboard: " + src
              }
            });
        });
      }
    }
  ]
};
