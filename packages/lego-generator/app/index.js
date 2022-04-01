'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const Generator = require('yeoman-generator');
const tplList = require('./templates/index')

module.exports = class extends Generator {
  constructor(...args) {
    super(...args);
    this.props = args[1].options || {};
  }


  prompting() {
    const prompts = [];

    if (!this.props.template) {
      prompts.push({
        type: 'list',
        name: 'template',
        message: '[模板名称]',
        choices: tplList,
        default: 'template-pc',
      })
    }

    return this.prompt(prompts).then(answers => {
      this.props = {
        ...this.props,
        ...answers,
      };
    });
  }

  writing() {
    const { appName, template } = this.props;

    const destinationPath = this.destinationPath(appName || './');
    const templateSourceRoot = path.join(__dirname, './templates', template);
    this._walkCopyTpl(templateSourceRoot, destinationPath);
  }

  _walkCopyTpl(fromPath, toPath) {
    if (fs.statSync(fromPath).isDirectory()) {
      return fs.readdirSync(fromPath).forEach((name) => {
        this._walkCopyTpl(path.join(fromPath, name), path.join(toPath, name));
      });
    }

    if (isTpl(fromPath)) {
      this.fs.copyTpl(fromPath, toPath, this.props);
    } else {
      this.fs.copy(fromPath, toPath);
    }

    function isTpl(fromPath) {
      return /(\.js|\.css|\.html|\.md|\.json|\.gitignore)$/.test(fromPath);
    }
  }

  install() {
    process.chdir(this.destinationPath(this.props.appName));
    this.log(chalk.green('\n🚀  正在安装项目依赖，这个步骤可能会花上一些时间\n'));
    this.spawnCommandSync('npm', ['install']);
    this.spawnCommandSync('git', ['add', '.']);
    this.spawnCommandSync('git', ['commit', '-a', '-m', 'init']);
  }

  end() {
    this.log(chalk.green(`🎉  项目成功创建在 ${this.destinationPath()}\n`));
    this.log(chalk.green(`\tcd ${this.props.appName}\n`));
  }
};
