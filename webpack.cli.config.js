const path = require('path');
const webpack = require('webpack');

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
    },
    plugins: [
        new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
    ],
};