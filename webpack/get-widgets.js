const glob = require('glob');
const path = require('path');

/**
 * Получить список всех виджетов
 */
module.exports = function(pathDir) {
    const trim = function (s, c) {
        if (c === "]") {
            c = "\\]";
        }
        if (c === "\\") {
            c = "\\\\";
        }
        return s.replace(new RegExp(
            "^[" + c + "]+|[" + c + "]+$", "g"
        ), "");
    };

    const context = glob.sync('*/', {
        cwd: pathDir
    });
    const widgets = {};
    context.forEach(function(dirName) {
        const name = trim(dirName, '/');
        widgets[name] = path.resolve(pathDir, name, 'index.ts');
    });
    return widgets;
};
