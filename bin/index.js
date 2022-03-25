#!/usr/bin/env node

const packageJson = require('./../package.json');

const commands = ['add', 'remove', 'view'];
const optionsLength = {
  add: 5,
  remove: 4,
  view: 4
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
  console.log('Usage: n-bootstart <command> [arg1] [arg2] ... [argn] \n');
  console.log("n-bootstart add [project-name] [path]                       starts the provided project when the system starts up\n");
  console.log("n-bootstart remove [project-name]                           removes the boot-start script of the mentioned project\n");
  console.log("n-bootstart view [project-name]                             displays the path of the mentioned project\n\n");
  console.log('Examples: \n');
  console.log("n-bootstart add gateway-app D:\/gateway-backend              starts the 'gateway-app' project when the system starts up\n");
  console.log("n-bootstart remove gateway-app                              removes the boot-start script of the 'gateway-app' project\n");
  console.log("n-bootstart view gateway-app                                displays the path of the 'gateway-app' project\n");
}

module.exports = require('../lib/script');

