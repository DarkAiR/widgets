const { readdirSync, existsSync, lstatSync, unlinkSync, rmdirSync } = require('fs');
const webfontsGenerator = require('webfonts-generator');

function removeDirSync(path) {
    if (!existsSync(path)) {
        return;
    }
    // remove files and directories recursively
    readdirSync(path).forEach(file => {
        const curPath = `${path}/${file}`;
        if (lstatSync(curPath).isDirectory()) {
            removeDirSync(curPath);
        } else {
            unlinkSync(curPath);
        }
    });

    rmdirSync(path);
}

async function buildCSSFromSVG(svgList) {
    return new Promise(resolve => {
        webfontsGenerator(
            {
                cssTemplate: 'src/font/css.hbs',
                files: svgList,
                fontName: 'iconfont',
                dest: 'lib/fonts',
                order: ['eot', 'woff', 'ttf', 'svg'],
                types: ['eot', 'woff', 'ttf', 'svg'],
                html: true,
                // fontHeight: 1001,
                normalize: true,
                // rename: utils.renameIcon,
                // codepoints: codepoints,
                templateOptions: {
                    classPrefix: 'icon-',
                    baseSelector: 'icon'
                }
            },
            resolve
        );
    });
}

async function build() {
    removeDirSync('lib/fonts');

    const svgList = readdirSync('src/font/mdi_font')
        .sort()
        .map(file => `src/font/mdi_font/${file}`);

    // make fonts
    await buildCSSFromSVG(svgList);
}


build().catch(error => {
    console.log(error.message);
});
