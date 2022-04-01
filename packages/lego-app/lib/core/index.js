'use strict';
const chalk = require('chalk');
const semver = require('semver');
const path = require('path');
const fs = require('fs-extra');
const validateProjectName = require('validate-npm-package-name');
const yeoman = require('yeoman-environment');
const yeomanEnv = yeoman.createEnv();

class Init {
    constructor(props) {
        this.props = props;
    }

    init() {
        const { appName } = this.props;
        if (typeof appName === 'undefined') {
            console.error('请制定项目目录:');
            console.log(
                `  ${chalk.cyan('lego init')} ${chalk.green('<project-directory>')}`
            );
            console.log();
            console.log('例如:');
            console.log(
                `  ${chalk.cyan('lego init')} ${chalk.green('my-react-app')}`
            );
            console.log();
            console.log(
                `运行 ${chalk.cyan(`${'lego'} --help`)} 查看所有选项`
            );
            process.exit(1);
        }

        // TODO 校验版本是否为最新


        const unsupportedNodeVersion = !semver.satisfies(
            semver.coerce(process.version),
            '>=14'
        );

        if (unsupportedNodeVersion) {
            console.log(
                chalk.yellow(
                    `You are using Node ${process.version} so the project will be bootstrapped with an old unsupported version of tools.\n\n` +
                    `Please update to Node 14 or higher for a better, fully supported experience.\n`
                )
            );
        }

        this.checkAppName();

        yeomanEnv.register(require.resolve('lego-generator'), 'lego-generator');
        yeomanEnv.run("lego-generator", {
            'skip-install': true,
            options: this.props
        });
    }

    /**
     * 验证 projectName 是否有效
     */
    checkAppName() {
        const { appName } = this.props;

        const validationResult = validateProjectName(appName);
        if (!validationResult.validForNewPackages) {
            console.error(
                chalk.red(
                    `无法创建 projectName 为${chalk.green(
                        `"${this.appName}"`
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

        // TODO 统一保存依赖项
        const dependencies = ['react', 'react-dom', 'react-scripts'];
        if (dependencies.includes(appName)) {
            console.error(
                chalk.red(
                    `Cannot create a project named ${chalk.green(
                        `"${appName}"`
                    )} because a dependency with the same name exists.\n` +
                    `Due to the way npm works, the following names are not allowed:\n\n`
                ) +
                chalk.cyan(dependencies.map(depName => `  ${depName}`).join('\n')) +
                chalk.red('\n\nPlease choose a different project name.')
            );
            process.exit(1);
        }
    }
}

module.exports = function (appName, options) {
    const init = new Init(appName, options);

    return init.init();
};