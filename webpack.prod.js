const merge = require('webpack-merge');

module.exports = (env) => {
    const common = require('./webpack.common.js')();

    return merge(common, {
        mode: 'production'      // see config.optimization.minimize for more information
    });
}
