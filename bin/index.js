#!/usr/bin/env node

const packageJson = require('./../package.json');

const commands = ['add', 'remove', 'view', 'list'];
const optionsLength = {
  add: 6,
  remove: 4,
  view: 4,
  list: 3
};

function getArg(index) {
  return process.argv[index] ? process.argv.slice(index)[0].toString().trim() : '';
};

function isValidCommand() {
  let command = getArg(2);
  return commands.indexOf(command) > -1 && process.argv.length <= optionsLength[command];
};

console.log('                               ---------------------------------- ');
console.log(`                              |        n-bootstart v${packageJson.version}        |`);
console.log('                               ---------------------------------- ');
if (isValidCommand()) {
  require('../lib/process-command');
} else {
  console.log('Usage: n-bootstart <command> [args] \n');
  console.log("n-bootstart add [project-name] [path] [env-var1,env-var2]   starts the project using the provided arguments when the system starts up\n");
  console.log("n-bootstart remove [project-name]                           removes the boot-start script of the mentioned project\n");
  console.log("n-bootstart view [project-name]                             displays the info of the mentioned project\n");
  console.log("n-bootstart list                                            displays the project-names enabled with boot-start\n\n");
  console.log('Examples: \n');
  console.log("n-bootstart add BE-API D:\/be-api port=9099,secure=true      starts the 'BE-API' project using the provided path & env variables when the system starts up\n");
  console.log("n-bootstart remove BE-API                                   removes the boot-start script of the project - 'BE-API'\n");
  console.log("n-bootstart view BE-API                                     displays the info for the project - 'BE-API'\n");
}

module.exports = require('../lib/script');

