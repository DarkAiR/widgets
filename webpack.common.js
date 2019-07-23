const path = require('path');

module.exports = (env) => {

    stylesOptions =  {
        sourceMap: process.env.NODE_ENV === 'dev',
        modules: true,
        importLoaders: 1,
        exportOnlyLocals: true,
        localIdentName:   process.env.NODE_ENV === 'dev'
            ? '[name]-[local]'
            : '[hash:base64:5]',
        namedExport: true,
    };

    process.noDeprecation = true;

    return {
        target: 'web',     // compile with or without webpackJsonp
        entry: {
            "abc-charts": path.resolve(__dirname, 'src', 'index.ts'),
            widgetFactory: path.resolve(__dirname, 'src', 'widgetFactory/index.ts'),
            // chartBar: path.resolve(__dirname, 'src', 'chartBar/index.ts'),
            averageNumberChart: path.resolve(__dirname, 'src', 'averageNumberChart/index.ts'),
            splineChart: path.resolve(__dirname, 'src', 'splineChart/index.ts'),
            solidGaugeChart: path.resolve(__dirname, 'src', 'solidGaugeChart/index.ts'),
            indicatorsTableChart: path.resolve(__dirname, 'src', 'indicatorsTableChart/index.ts'),
            // widget2: path.resolve(__dirname, 'src', 'widget2/index.ts'),
        },
        output: {
            path: path.resolve(__dirname, 'lib'),
            filename: '[name].js',
            library: 'abc-charts',
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
                        presets: [[
                            '@babel/preset-env',
                            { modules: false }
                        ]]
                    },
                }],
            }, {
                test: /\.(less|css)$/,
                use: [{
                    loader: 'style-loader'
                }, {
                    // css-loader + создание .d.ts для нормального импорта стилей в код
                    loader: 'typings-for-css-modules-loader',
                    options: Object.assign(stylesOptions, {
                        silent: true
                    })
                }, {
                    loader: 'uglifycss-loader',
                }, {
                    loader: 'less-loader',
                    options: {
                        sourceMap: process.env.NODE_ENV === 'dev',
                        strictImports: false        // Отключаем контроль строгих Import
                    }
                }]
            }, {
                test: /\.(scss|sass)$/,
                use: [{
                    loader: 'style-loader'
                }, {
                    // css-loader + создание .d.ts для нормального импорта стилей в код
                    loader: 'typings-for-css-modules-loader',
                    options: Object.assign(stylesOptions, {
                        camelCase: true
                    })
                }, {
                    loader: 'sass-loader',
                    options: {
                        sourceMap: process.env.NODE_ENV === 'dev',
                    }
                }]
            }, {
                test: /\.ttf$/,
                use: {
                    loader: 'ttf-loader',
                }
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
                "abc-charts$": path.resolve(__dirname, "lib/abc-charts.js")
            }
        },
        plugins: [
        ]
    }
};
