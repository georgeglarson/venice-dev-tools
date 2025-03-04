const path = require('path');
const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/browser-entry.ts', // Use a browser-specific entry point
  target: 'web', // Target the browser environment
  output: {
    filename: 'browser-bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'VeniceAI',
      type: 'umd',
      export: 'default',
    },
    globalObject: 'this',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: [
          /node_modules/,
          /src\/cli\.ts$/, // Exclude CLI-specific code
          /src\/server\.ts$/, // Exclude server-specific code
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    // Provide browser-compatible fallbacks for Node.js modules
    fallback: {
      // Core Node.js modules that need polyfills
      "fs": false, // No direct replacement, use fetch API instead
      "path": require.resolve('path-browserify'),
      "process": require.resolve('process/browser'),
      "child_process": false, // No browser equivalent
      "events": require.resolve('events/'),
      "stream": require.resolve('stream-browserify'),
      "http": require.resolve('stream-http'),
      "https": require.resolve('https-browserify'),
      "buffer": require.resolve('buffer/'),
      "url": require.resolve('url/'),
      "util": require.resolve('util/'),
      "crypto": false, // Use Web Crypto API instead
      "os": false, // No direct browser equivalent
      "assert": false, // Use browser's console.assert
      "constants": false, // No direct browser equivalent
      "querystring": require.resolve('querystring-es3'),
      "timers": require.resolve('timers-browserify'),
      "zlib": require.resolve('browserify-zlib'),
      "tty": false, // No browser equivalent
      "net": false, // No browser equivalent
      "dns": false, // No browser equivalent
      "readline": false, // No browser equivalent
    }
  },
  plugins: [
    // Provide global variables for browser compatibility
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    // Use NodePolyfillPlugin as an additional layer of compatibility
    new NodePolyfillPlugin({
      excludeAliases: ['console']
    }),
    // Define environment variables
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.BROWSER': JSON.stringify(true),
    }),
    // Ignore Node.js specific imports
    new webpack.IgnorePlugin({
      resourceRegExp: /^(child_process|fs|readline|path)$/,
      contextRegExp: /./,
    }),
  ],
  // Avoid bundling these modules and use the ones provided by the browser
  externals: {
    // Add any browser globals you want to exclude from bundling
  },
  // Enable source maps for debugging
  devtool: 'source-map',
  // Optimization settings
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
  },
};