const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env) => {

    stylesOptions =  {
        sourceMap: process.env.NODE_ENV === 'dev',
        modules: true,
        importLoaders: 1,
        exportOnlyLocals: true,
        localIdentName:   process.env.NODE_ENV === 'dev'
            ? '[name]-[local]'
            : '[hash:base64:5]',
        namedExport: false,     // Disable transform to CamelCase from dashed-style
    };

    process.noDeprecation = true;

    return {
        target: 'web',     // compile with or without webpackJsonp
        entry: {
            "abc-charts": path.resolve(__dirname, 'src', 'index.ts'),
            widgetFactory: path.resolve(__dirname, 'src', 'widgetFactory/index.ts'),
            averageNumberChart: path.resolve(__dirname, 'src', 'averageNumberChart/index.ts'),
            splineChart: path.resolve(__dirname, 'src', 'splineChart/index.ts'),
            solidGaugeChart: path.resolve(__dirname, 'src', 'solidGaugeChart/index.ts'),
            indicatorsTableChart: path.resolve(__dirname, 'src', 'indicatorsTableChart/index.ts'),
        },
        output: {
            path: path.resolve(__dirname, 'lib'),
            filename: '[name].js',
            library: 'abc-charts',
            libraryTarget: 'umd',
            umdNamedDefine: true,
            publicPath: '/',                // Путь относительно которого загружаются ресурсы из бандла
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
                        // url: false,         // Не преобразовывать url из css, чтобы можно было грузить шрифты из пакетов
                        silent: true
                    })
                // }, {
                //     loader: path.resolve('webpack/filename-corrector.js'),
                }, {
                    loader: 'uglifycss-loader',
                }, {
                    loader: 'less-loader',
                    options: {
                        // relativeUrls: false,
                        sourceMap: process.env.NODE_ENV === 'dev',
                        strictImports: false        // Отключаем контроль строгих Import
                    }
                }]
            }, {
                // test: /\.(scss|sass)$/,
                // use: [{
                //     loader: 'style-loader'
                // }, {
                //     // css-loader + создание .d.ts для нормального импорта стилей в код
                //     loader: 'typings-for-css-modules-loader',
                //     options: Object.assign(stylesOptions, {
                //         camelCase: true
                //     })
                // }, {
                //     loader: 'sass-loader',
                //     options: {
                //         sourceMap: process.env.NODE_ENV === 'dev',
                //     }
                // }]
            }, {
                // Для загрузки svg для иконок
                // test: /\.svg/,
                // use: {
                //     loader: 'svg-url-loader',
                //     options: {}
                // }
            }, {
                // test: /\.(woff|woff2|eot|ttf|otf)$/,
                // use: [{
                //     loader: 'file-loader',
                //     options: {
                //         outputPath: 'fonts/pt_root_ui'
                //     }
                // }]
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
        resolveLoader: {
            modules: [
                path.join(__dirname, 'node_modules')
            ]
        },
        resolve: {
            modules: [
                path.join(__dirname, 'node_modules')
            ],
            // modules: [__dirname, 'src'],
            extensions: ['.ts', '.js'],
            alias: {
                "abc-charts$": path.resolve(__dirname, "lib/abc-charts.js")
            }
        },
        plugins: [
            new CopyWebpackPlugin([
                {
                    from: './README.md',
                    to: 'README.md'
                }, {
                    from: './package-lib.json',
                    to: 'package.json'
                }, {
                    from: './src/styles/_styles.css',
                    to: 'styles.css'
                }, {
                    from: './node_modules/goodt-framework-css/dist/all.min.css',
                    to  : 'assets/all.min.css'
                }, {
                    from: './node_modules/@mdi/font/css/materialdesignicons.css',
                    to  : 'assets/materialdesignicons.css',
                    transform(content, path) {
                        return content.toString().replace(/\.\.\/fonts\//g, './fonts/');
                    }
                }, {
                    from: './node_modules/@mdi/font/fonts/',
                    to  : 'assets/fonts/'
                }, {
                    from: './node_modules/goodt-framework-css/fonts/',
                    to  : 'assets/fonts/'
                }
            ])
        ]
    }
};
