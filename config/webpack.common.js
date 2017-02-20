var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var helpers = require('./helpers');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var _ = require('lodash');
var consts = require('./consts/consts.js');
var StringReplacePlugin = require("string-replace-webpack-plugin");

const NODE_ENV = process.env.NODE_ENV || 'development';
module.exports = {
  entry: {
    'polyfills': './src/polyfills.ts',
    'vendor': './src/vendor.ts',
    'app': './src/main.ts'
  },

  resolve: {
    extensions: ['', '.ts', '.js']
  },

  module: {
    loaders: [
      {
        test: /\.ts$/,
        loaders: ['awesome-typescript-loader', 'angular2-template-loader']
      },
      {
        test: /\.html$/,
        loader: 'html'
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        loaders: ['raw-loader', 'sass-loader'] // sass-loader not scss-loader
      },
    ]
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: ['app', 'vendor', 'polyfills']
    }),

    new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),

    new CopyWebpackPlugin([
      { from: 'src/app/assets', to: 'assets' }
    ]),

    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(NODE_ENV),
        'CONSTS': JSON.stringify(_.extend(consts, require('./consts/' + NODE_ENV)))
      }
    }),
  ]
};
