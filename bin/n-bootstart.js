#!/usr/bin/env node

/**
 * This source code is licensed under MIT.
 */

const packageJson = require('../package.json');

const os = require('os');
const isLinux = os.type().indexOf('Windows') > -1 ? false : true;
const examplePath = isLinux ? '/home/user1/projects/be-api/index.js' : 'D:\/be-api/index.js';
const exampleExternalPath = isLinux ? '/home/user1/projects/be-api/app.json' : 'D:\/be-api/app.json';
let cmdSymbol = isLinux ? '$' : '>';
cmdSymbol = os.type().indexOf('Darwin') > -1 ? '#' : cmdSymbol;
const commands = ['add', 'remove', 'view', 'list', 'examples'];
const optionsLength = {
  add: 7,
  remove: 4,
  view: 4,
  list: 3,
  examples: 3
};

function getArg(index) {
  return process.argv[index] ? process.argv.slice(index)[0].toString().trim() : '';
};

function isValidCommand() {
  let command = getArg(2);
  return commands.indexOf(command) > -1 && process.argv.length <= optionsLength[command];
};

console.log('                                           -------------------------- ');
console.log(`                                          | (node)n-bootstart v${packageJson.version} |`);
console.log('                                           -------------------------- ');
if (isValidCommand()) {
  if (getArg(2) === 'examples') {
    console.log('Usage: n-bootstart <command> [args] \n');
    console.log('Examples: \n');
    console.log('1. Enable boot-start for a project.\n');
    console.log(`   [ WITH ENVIRONMENT VARIABLES ]`);
    console.log(`   Params -> { Name: 'BE-API', Start_file_path: '${examplePath}', Env_variables: { port: 9000, secure: true } }`);
    console.log(`   ${cmdSymbol} n-bootstart add BE-API ${examplePath} port=9099,secure=true\n`);
    console.log(`   [ WITHOUT ENVIRONMENT VARIABLES ]`);
    console.log(`   Params -> { Name: 'BE-API', Start_file_path: '${examplePath}' }`);
    console.log(`   ${cmdSymbol} n-bootstart add BE-API ${examplePath}\n`);
    console.log(`   [ USING ANY NPM MODULES (like 'pm2') ]`);
    console.log(`   Hint : Pass the env variables 'nboot_npm_name' & 'nboot_npm_cmd' to execute the command of a npm module.\n          Please ensure that the NPM module you are trying to use is already installed as a global package`);
    console.log(`   Params -> { \n               Name:'BE-API', Start_file_path: '${exampleExternalPath}',`);
    console.log(`               Env_variables: { nboot_npm_name: pm2, nboot_npm_cmd: start, env:uat }`);
    console.log(`             }`);
    console.log(`   ${cmdSymbol} n-bootstart add BE-API ${exampleExternalPath} nboot_npm_name=pm2,nboot_npm_cmd=start,env=uat\n`);
    console.log('2. Disable boot-start for an existing project.');
    console.log(`   ${cmdSymbol} n-bootstart remove BE-API\n`);
    console.log('3. View the configured information for a project.');
    console.log(`   ${cmdSymbol} n-bootstart view BE-API\n`);
    console.log('4. List all the configured projects.');
    console.log(`   ${cmdSymbol} n-bootstart list`);
  } else {
    require('../lib/process-command');
  }
} else {
  console.log('Usage: n-bootstart <command> [args] \n');
  console.log('Commands: \n');
  console.log("   add [project-name] [start-file-path] [env1,env2]         enables the boot-start for a project\n");
  console.log("   remove [project-name]                                    disables the boot-start for the mentioned project\n");
  console.log("   view [project-name]                                      displays the configured info for the mentioned project\n");
  console.log("   list                                                     displays all the project-names enabled with boot-start\n");
  console.log("   examples                                                 displays the example syntax for the available commands");
}