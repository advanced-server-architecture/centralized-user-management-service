'use strict';
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack');

module.exports = {
	plugins:[
		new ExtractTextPlugin('App.css', {
			allChunk: true
		})
	],
    devtool: 'source-map',
    resolve: {
        root: path.resolve(__dirname, 'src')
    },
	module: {
		loaders: [
			{
				test: /\.scss$/,
				//loader: 'style-loader/useable!css-loader!postcss-loader!sass-loader'
				loader: ExtractTextPlugin.extract('style', 'css?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!sass')
			},

			{
				test: /\.css$/,
				loader: 'style!css'
			},
			{
				test: /\.js$/,
      			exclude: /(node_modules|bower_components)/,
				loader: 'babel-loader',
				query: {
					cacheDirectory: true,
    				plugins: [
    					'transform-decorators-legacy',
    					['antd', {
    						style: 'css'
    					}]
    				],
					presets: ['es2015', 'stage-0', 'react']
				}
			}
		]
	},
    entry: {
		app: [path.resolve(__dirname, 'src/App.js')]
	},
    output: {
		path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    }
};
