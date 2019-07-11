const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = (env) => {
    const common = require('./webpack.common.js')({sourceMap: true});

    return merge(common, {
        mode: 'development',
        devtool: 'inline-source-map',
    });
}
