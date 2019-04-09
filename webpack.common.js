const path = require('path');
const TypescriptDeclarationPlugin = require('typescript-declaration-webpack-plugin');

module.exports = {
    target: 'web',     // compile with or without webpackJsonp
    entry: {
        "ui-abc": path.resolve(__dirname, 'src', 'index.ts'),
        widget1: path.resolve(__dirname, 'src', 'widget1/index.ts'),
        widget2: path.resolve(__dirname, 'src', 'widget2/index.ts'),
        //mychart: path.resolve(__dirname, 'src', 'chart/index.ts')
    },
    output: {
        path: path.resolve(__dirname, 'lib'),
        filename: '[name].js',
        library: 'ui-abc',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        publicPath: '/',
    },
    optimization: {
        // runtimeChunk: true,         // exclude webpackBootstrap
        splitChunks: {
            chunks: 'async',
        }
    },
    module: {
        rules: [{
            test: /\.ts$/,
            use: [{
                loader: 'ts-loader',
            }],
            exclude: /node_modules/
        }, {
            test: /\.js$/,
            include: [path.resolve(__dirname, 'src')],
            use: [{
                loader: 'babel-loader',
                options: {
                    plugins: ['syntax-dynamic-import'],
                    presets: [
                        [
                            '@babel/preset-env',
                            { modules: false }
                        ]
                    ]
                },
            }],
        }, {
            test: /\.(less|css)$/,
            use: [{
                loader: 'style-loader'
            }, {
                // css-loader + создание .d.ts для нормального импорта стилей в код
                loader: 'typings-for-css-modules-loader',
                options: {
                    sourceMap: true,
                    modules: true,
                    importLoaders: 1,
                    exportOnlyLocals: true,
                    localIdentName: '[name]-[local]-[hash:base64:5]',
                    namedExport: true
                }
            }, {
                loader: 'less-loader',
                options: {
                    sourceMap: true
                }
            }]
        }, {
            test: /\.(html)$/,
            use: {
                loader: 'html-loader',
                options: {
                    attrs: [':data-src']
                }
            }
        }]
    },
    resolve: {
        // modules: [__dirname, 'src'],
        extensions: ['.ts', '.js'],
        alias: {
            "ui-abc$": path.resolve(__dirname, "lib/ui-abc.js"),
            "widget1": path.resolve(__dirname, "lib/widget1.js")
        }
    },
    plugins: [
        // new TypescriptDeclarationPlugin({
        //     out: '../ui-abc.d.ts'
        // })
    ]
};
