#!/usr/bin/env node
'use strict';

const fs = require('fs');
const child_process = require('child_process');
const pkg = require('./package.json');
const program = require('commander');

program
  .version(pkg.version)
  .usage("[options] <files/dirs...>")
  .description("Print the permission attributes of the given files and directories")
  .option("-h, --human-readable", "print the access rights in human readable form")
  .option("-u, --user", "print user name of owner")
  .option("-g, --group", "print group name of owner")
  .option("-o, --octal", "print access rights in octal")
  .parse(process.argv);

if (program.rawArgs.length < 4 || program.args.length === 0) {
  program.help();
} else {
  var options = "%n";
  var cmd = 'stat -c ';

  if (program.user)           options = "%U " + options;
  if (program.group)          options = "%G " + options;
  if (program.octal)          options = "%a " + options;
  if (program.humanReadable)  options = "%A " + options;

  cmd = cmd + '"' + options + '" ' + program.args.join(" ");
  console.log(child_process.execSync(cmd).toString());
}
