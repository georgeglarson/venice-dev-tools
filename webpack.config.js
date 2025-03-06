const path = require('path');
const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const NodeProtocolPlugin = require('./node-protocol-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.ts',
    target: 'web',
    output: {
        filename: 'bundle.js',
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
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        // Add fallbacks for Node.js core modules
        fallback: {
            // Standard Node.js modules
            "fs": false,
            "path": require.resolve('path-browserify'),
            "process": require.resolve('process/browser'),
            "child_process": false,
            "events": require.resolve('events/'),
            "stream": require.resolve('stream-browserify'),
            "http": require.resolve('stream-http'),
            "https": require.resolve('https-browserify'),
            "buffer": require.resolve('buffer/'),
            "url": require.resolve('url/'),
            "util": require.resolve('util/'),
            "readline": false,
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
            
            // Node: prefixed modules (modern Node.js imports)
            "node:fs": false,
            "node:path": require.resolve('path-browserify'),
            "node:process": require.resolve('process/browser'),
            "node:child_process": false,
            "node:events": require.resolve('events/'),
            "node:readline": false,
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
        new NodePolyfillPlugin({
            includeAliases: ['Buffer', 'process', 'events', 'path', 'fs', 'child_process', 'readline']
        }),
        // Provide global variables for browser compatibility
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        }),
        // Add our custom plugin to handle node: protocol
        new NodeProtocolPlugin(),
    ],
    node: {
        global: true,
        __filename: true,
        __dirname: true,
    },
};