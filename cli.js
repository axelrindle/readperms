#!/usr/bin/env node
'use strict';

// Require modules
const child_process = require('child_process');
const pkg = require('./package.json');
const program = require('commander');
const columnify = require('columnify');
const versionCheck = require('github-version-checker');
const chalk = require('chalk');

// Define program.
program
  .name('readperms')
  .version(pkg.version)
  .usage('[options] <files/dirs...>')
  .description('Print the permission attributes of the given files and directories')
  .option('-h, --human-readable', 'print the access rights in human readable form')
  .option('-o, --octal', 'print access rights in octal')
  .option('-u, --user', 'print user name of owner')
  .option('-g, --group', 'print group name of owner')
  .parse(process.argv);

// Handler function
const execute = () => {
	if (program.rawArgs.length < 4 || program.args.length === 0) {
		program.help();
	} else {
		let options = '%n';
		const columns = ['file/directory'];
		let cmd = 'stat -c ';

        if (program.group) {         options = '%G ' + options; columns.unshift('group');         }
        if (program.user) {          options = '%U ' + options; columns.unshift('user');          }
		if (program.octal) {         options = '%a ' + options; columns.unshift('octal');         }
		if (program.humanReadable) { options = '%A ' + options; columns.unshift('humanReadable'); }

    cmd = cmd + '"' + options + '" ' + program.args.join(' ');

    // filter and split results for columnifying
    const result = child_process.execSync(cmd).toString();
    const lines = result.split('\n').filter(value => value !== '');
    const data = [];
    lines.forEach(el => {
      const all = el.split(' ');
      const obj = {};
      all.forEach((el, i) => {
        obj[columns[i]] = el;
      });
      data.push(obj);
    });

    // log results
    console.log(columnify(data, {
      minWidth: 10
    }));
  }
};

// Check for updates
const updateOpts = {
  owner: 'axelrindle',
  repo: 'readperms',
  currentVersion: pkg.version
};
versionCheck(updateOpts)
  .then((update) => {
    if (update) {
      console.log('- - - - - - - - - - - - - - - - - - - - - - - - -');
      console.log('  ' + chalk.green('An update is available: ') + chalk.bold(update.tag_name));
      console.log('  ' + chalk.cyan('You are on version ') + chalk.bold(updateOpts.currentVersion) + '!');
      console.log('- - - - - - - - - - - - - - - - - - - - - - - - -');
    }
  })
  .catch((error) => {
    if (error) {
      console.error(chalk.red('  Failed to check for updates!'));
    }
  })
  .finally(execute);
