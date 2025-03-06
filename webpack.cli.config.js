const path = require('path');
const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const NodeProtocolPlugin = require('./node-protocol-plugin');

module.exports = {
    mode: 'development',
    entry: './src/cli.ts',
    target: 'node',
    output: {
        filename: 'cli.js',
        path: path.resolve(__dirname, 'dist'),
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
        fallback: {
            // Standard Node.js modules
            "child_process": false,
            "fs": false,
            "path": false,
            "process": false,
            "events": false,
            "readline": false,
            // Node: prefixed modules (modern Node.js imports)
            "node:child_process": false,
            "node:fs": false,
            "node:path": false,
            "node:process": false,
            "node:events": false,
            "node:readline": false,
            "node:https": false,
            "node:http": false,
            "node:url": false,
            "node:util": false,
            "node:buffer": false,
            "node:stream": false,
            "node:zlib": false,
            "node:crypto": false,
            "node:os": false,
            "node:assert": false,
            "node:constants": false,
            "node:querystring": false,
            "node:timers": false,
            "node:tty": false,
            "node:net": false,
            "node:dns": false
        },
        alias: {
            // Add an alias for readline
            readline: require.resolve('readline-browserify')
        }
    },
    plugins: [
        new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
        new NodePolyfillPlugin({
            includeAliases: ['Buffer', 'process', 'events', 'path', 'fs', 'child_process', 'readline']
        }),
        // Provide global variables
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        }),
        // Add our custom plugin to handle node: protocol
        new NodeProtocolPlugin(),
    ],
};