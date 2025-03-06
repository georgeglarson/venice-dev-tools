const path = require('path');
const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const NodeProtocolPlugin = require('./node-protocol-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  target: 'node', // Target Node.js environment
  output: {
    filename: 'test-bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'commonjs2', // Use CommonJS2 for Node.js compatibility
    },
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    // Provide proper fallbacks for Node.js modules
    fallback: {
      // Core Node.js modules
      "fs": false,
      "path": require.resolve('path-browserify'),
      "process": require.resolve('process/browser'),
      "child_process": false,
      "events": require.resolve('events/'),
      "readline": require.resolve('readline-browserify'),
      "stream": require.resolve('stream-browserify'),
      "http": require.resolve('stream-http'),
      "https": require.resolve('https-browserify'),
      "buffer": require.resolve('buffer/'),
      "url": require.resolve('url/'),
      "util": require.resolve('util/'),
      "crypto": false,
      "os": false,
      "assert": false,
      "constants": false,
      "querystring": require.resolve('querystring-es3'),
      "timers": require.resolve('timers-browserify'),
      "zlib": require.resolve('browserify-zlib'),
      "tty": false,
      "net": false,
      "dns": false,
      
      // Node: prefixed modules
      "node:fs": false,
      "node:path": require.resolve('path-browserify'),
      "node:process": require.resolve('process/browser'),
      "node:child_process": false,
      "node:events": require.resolve('events/'),
      "node:readline": require.resolve('readline-browserify'),
      "node:stream": require.resolve('stream-browserify'),
      "node:http": require.resolve('stream-http'),
      "node:https": require.resolve('https-browserify'),
      "node:buffer": require.resolve('buffer/'),
      "node:url": require.resolve('url/'),
      "node:util": require.resolve('util/'),
      "node:crypto": false,
      "node:os": false,
      "node:assert": false,
      "node:constants": false,
      "node:querystring": require.resolve('querystring-es3'),
      "node:timers": require.resolve('timers-browserify'),
      "node:zlib": require.resolve('browserify-zlib'),
      "node:tty": false,
      "node:net": false,
      "node:dns": false
    }
  },
  plugins: [
    // Provide global variables
    new webpack.ProvidePlugin({
      process: 'process',
      Buffer: ['buffer', 'Buffer'],
    }),
    // Use NodePolyfillPlugin as an additional layer of compatibility
    new NodePolyfillPlugin({
      includeAliases: ['Buffer', 'process', 'events', 'path', 'fs', 'child_process', 'readline'],
      excludeAliases: ['console']
    }),
    // Add our custom plugin to handle node: protocol
    new NodeProtocolPlugin(),
    // Define environment variables
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.BROWSER': JSON.stringify(false),
      'process.env.NODE': JSON.stringify(true),
    }),
  ],
  // Enable source maps for debugging
  devtool: 'source-map',
  // Optimization settings
  optimization: {
    minimize: false, // Don't minimize for better debugging
  },
  // Don't externalize Node.js modules for the test bundle
  // This ensures they're properly polyfilled and bundled
  externals: {},
};