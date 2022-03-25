#!/usr/bin/env node

const packageJson = require('./../package.json');

const commands = ['add', 'remove', 'status'];
const optionsLength = {
  add: 5,
  delete: 4,
  status: 4
};

const getArg = (index) => {
  return process.argv[index] ? process.argv.slice(index)[0].toString().trim() : '';
};

const isValidCommand = () => {
  let command = getArg(2);
  return commands.indexOf(command) > -1 && process.argv.length <= optionsLength[command];
};

console.log('                               ---------------------------------- ');
console.log(`                              |        n-bootstart v${packageJson.version}        |`);
console.log('                               ---------------------------------- ');
if (isValidCommand()) {
  require('../lib/process-command');
} else {
  console.log('Usage: n-bootstart <command> [arg1] [arg2] \n');
  console.log("n-bootstart add [project-name] [path]                       starts the provided project when the system starts up\n");
  console.log("n-bootstart remove [project-name] [path]                    disables the n-bootstart for the provided project\n\n");
  console.log('Examples: \n');
  console.log("n-bootstart add gateway-app D:\/gateway-backend              starts the 'gateway-app' project when the system starts up\n");
  console.log("n-bootstart remove gateway-app D:\/gateway-backend           disables the n-bootstart for the 'gateway-app' project\n");
}

require('../lib/script');

