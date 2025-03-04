const path = require('path');
const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

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
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /server\.ts$/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: {
            "child_process": false,
            "fs": false,
            "path": false,
            "process": false,
            "events": false,
            "https": require.resolve("https-browserify"),
            "readline": false
        },
        alias: {
            // Handle node: protocol imports
            "node:child_process": false,
            "node:fs": false,
            "node:path": false,
            "node:process": false,
            "node:events": false,
            "node:https": require.resolve("https-browserify"),
            "node:readline": false
        }
    },
    plugins: [
        new NodePolyfillPlugin()
    ]
};