#!/usr/bin/env node
'use strict';

const fs = require('fs');
const child_process = require('child_process');
const pkg = require('./package.json');
const program = require('commander');
const columnify = require('columnify');

program
  .name("readperms")
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
  var columns = ["name"]
  var cmd = "stat -c ";

  if (program.user)          { options = "%U " + options; columns.unshift("user"); }
  if (program.group)         { options = "%G " + options; columns.unshift("group"); }
  if (program.octal)         { options = "%a " + options; columns.unshift("octal"); }
  if (program.humanReadable) { options = "%A " + options; columns.unshift("humanReadable"); }

  cmd = cmd + '"' + options + '" ' + program.args.join(" ");

  // filter and split results for columnifying
  var result = child_process.execSync(cmd).toString();
  var lines = result.split("\n");
  var lines_filtered = lines.filter(value => value !== "");
  var data = [];
  lines_filtered.forEach(el => {
    var all = el.split(" ");
    var obj = {};
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
