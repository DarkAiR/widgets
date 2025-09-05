const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    mode: 'development',
    entry: path.join(__dirname, 'examples/src/index.ts'),
    module: {
        rules: [{
            test: /\.ts$/,
            use: [{
                loader: 'ts-loader',
            }],
            include: [
                path.resolve(__dirname, 'src'),
                path.resolve(__dirname, 'examples')
            ],
            exclude: /node_modules/
        }, {
            test: /\.js$/,
            include: [
                path.resolve(__dirname, 'src'),
                path.resolve(__dirname, 'examples')
            ],
            exclude: /node_modules/,
            use: {
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
            }
        }, {
            test: /\.css$/,
            use: [{
                loader: 'style-loader',
            }, {
                loader: 'css-loader',
                options: {
                    sourceMap: true
                }
            }]
        }, {
            test: /\.less$/,
            use: [{
                loader: 'style-loader'
            }, {
                loader: 'css-loader',
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
        }]
    },
    resolve: {
        extensions: ['.ts.', '.js'],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "examples/src/index.html"),
            filename: "./index.html"
        })
    ],
    devServer: {
        port: 3001
    }
};
