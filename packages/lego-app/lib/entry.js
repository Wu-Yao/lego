'use strict';

const currentNodeVersion = process.versions.node;
const semver = currentNodeVersion.split('.');
const major = semver[0];
const { Command } = require('commander');
const packageJson = require('../package.json');
const init = require('./core/index')




function entry() {
    if (major < 14) {
        console.error(
            'You are running Node ' +
            currentNodeVersion +
            '.\n' +
            'Create React App requires Node 14 or higher. \n' +
            'Please update your version of Node.'
        );
        process.exit(1);
    }

    const program = new Command(packageJson.name);

    program.version(packageJson.version)
        .description('initialize project.')
        .arguments('[project-directory]')
        .option(
            '-t, --template <path-to-template>',
            '指定项目模板'
        )
        .option('--info', '打印环境调试信息') // TODO
        .allowUnknownOption()  //允许使用未知的选项
        .action((appName) => {
            init({
                ...program.opts(),
                appName
            })
        })
        .on('--help', () => {
            console.log("自定义事件");
        })
    program.parse(process.argv);
}


module.exports = entry;