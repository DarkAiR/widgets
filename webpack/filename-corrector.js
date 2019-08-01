const path = require('path');

module.exports = function(content) {
    return content.replace(/url\s*\(\s*['"](?!data:)(.*?)['"]/g, (match, capture) => {
        return match.split('%20').join(' ');
    });
};
