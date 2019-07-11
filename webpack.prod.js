const merge = require('webpack-merge');

module.exports = (env) => {
    const common = require('./webpack.common.js')({sourceMap: false});

    return merge(common, {
        mode: 'production'
    });
}
