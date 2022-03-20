#!/usr/bin/env node

const packageJson = require('./../package.json');
const { getStatus, enable, disable } = require('../lib/script');

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

console.log('                          ---------------------------------- ');
console.log(`                         |       Start-On-Boot v${packageJson.version}       |`);
console.log('                          ---------------------------------- ');
if (isValidCommand()) {
  require('../lib/process-command');
} else {
  console.log('Usage: start-on-boot <command> [arg1] [arg2] \n');
  console.log("start-on-boot add [project-name] [path]                        enables the start-on-boot for the provided project, so that the project will be started when the system starts up\n\n");
  console.log('Examples: \n');
  console.log("start-on-boot add gateway-app D:\/projects\/gateway-backend      enables the start-on-boot for the 'gateway app' project\n");
}

module.exports = {
  getStatus, enable, disable
};

