'use strict';
const { Command } = require('commander');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const spawn = require('cross-spawn');
const validateProjectName = require('validate-npm-package-name');

const packageJson = require('./package.json');

function isUsingYarn() {
    return (process.env.npm_config_user_agent || '').indexOf('yarn') === 0;
}

let projectName;
function init() {
    const program = new Command(packageJson.name)
        .version(packageJson.version)
        .arguments('[project-directory]')
        .usage(`${chalk.green('<project-directory>')} [options]`)
        .action(name => {
            projectName = name;
        })
        .option('--info', '打印环境调试信息') // TODO
        .option(
            '-t, --template <path-to-template>',
            '指定项目模板'
        )
        .allowUnknownOption()  //允许使用未知的选项
        .on('--help', () => {
            console.log("自定义事件");
        })
        .parse(process.argv);


    if (typeof projectName === 'undefined') {
        console.error('请制定项目目录:');
        console.log(
            `  ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}`
        );
        console.log();
        console.log('例如:');
        console.log(
            `  ${chalk.cyan(program.name())} ${chalk.green('my-react-app')}`
        );
        console.log();
        console.log(
            `运行 ${chalk.cyan(`${program.name()} --help`)} 查看所有选项`
        );
        process.exit(1);
    }




    const useYarn = isUsingYarn();
    createApp(
        projectName,
        program.verbose,
        program.scriptsVersion,
        program.template,
        useYarn,
        program.usePnp
    );
}


function createApp(name, verbose, version, template, useYarn, usePnp) {


    const root = path.resolve(name);
    const appName = path.basename(root);

    checkAppName(appName);
    fs.ensureDirSync(name);

    // TODO 判断文件夹中是否存在多余文件

    const packageJson = {
        name: appName,
        version: '0.1.0',
        private: true,
    };

    fs.writeFileSync(
        path.join(root, 'package.json'),
        JSON.stringify(packageJson, null, 2) + os.EOL
    );

    run(
        root
    );
}

function run(root) {
    const allDependencies = ['react', 'react-dom', 'react-scripts', 'cra-template'];
    install(root, allDependencies)
        .then(async () => {
            checkNodeVersion('react-scripts')

            await executeNodeScript(
                process.cwd(),
                [root, appName],
                `
                    const init = require('${packageName}/scripts/init.js');
                    init.apply(null, JSON.parse(process.argv[1]));
                    `
            );
        })
}

function install(root, dependencies) {
    return new Promise((resolve, reject) => {
        let command = 'npm';
        let args = [
            'install',
            '--save',
            '--save-exact',
        ].concat(dependencies);

        const child = spawn(command, args, { stdio: 'inherit' });
        child.on('close', code => {
            if (code !== 0) {
                reject({
                    command: `${command} ${args.join(' ')}`,
                });
                return;
            }
            resolve();
        });
    });
}


function checkAppName(appName) {
    const validationResult = validateProjectName(appName);
    if (!validationResult.validForNewPackages) {
        console.error(
            chalk.red(
                `无法创建 projectName 为${chalk.green(
                    `"${appName}"`
                )} 的工程:\n`
            )
        );
        [
            ...(validationResult.errors || []),
            ...(validationResult.warnings || []),
        ].forEach(error => {
            console.error(chalk.red(`  * ${error}`));
        });
        console.error(chalk.red('\n请选择其他项目名称.'));
        process.exit(1);
    }


}

function checkNodeVersion(packageName) {
    const packageJsonPath = path.resolve(
        process.cwd(),
        'node_modules',
        packageName,
        'package.json'
    );

    if (!fs.existsSync(packageJsonPath)) {
        return;
    }

    const packageJson = require(packageJsonPath);
    if (!packageJson.engines || !packageJson.engines.node) {
        return;
    }

    if (!semver.satisfies(process.version, packageJson.engines.node)) {
        console.error(
            chalk.red(
                'You are running Node %s.\n' +
                'Create React App requires Node %s or higher. \n' +
                'Please update your version of Node.'
            ),
            process.version,
            packageJson.engines.node
        );
        process.exit(1);
    }
}

function executeNodeScript(cwd, data, source) {
    return new Promise((resolve, reject) => {
        const child = spawn(
            process.execPath,
            ['-e', source, '--', JSON.stringify(data)],
            { cwd, stdio: 'inherit' }
        );

        child.on('close', code => {
            if (code !== 0) {
                reject({
                    command: `node ${args.join(' ')}`,
                });
                return;
            }
            resolve();
        });
    });
}

module.exports = {
    init,
};
