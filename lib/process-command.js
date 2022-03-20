'use strict';

/**
 * This source code is licensed under MIT.
 */

const os = require('os');
const { enable } = require('../lib/script');

async function handleCommands(isLinux) {
  switch (true) {
    case process.argv.slice(2)[0].toString().trim() === 'add':
      let name = process.argv.slice(3)[0];
      let path = process.argv.slice(4)[0];
      let result = enable(isLinux, name, path);
      if (result && result.err) {
        console.log(`Failed to enable start-on-boot for the project - '${name}'. ${result.err}`);
      } else {
        console.log(`Successfully enabled start-on-boot for the ${name} project`);
      }
      break;
  };

}

if (process.argv.slice(2).length > 0) {
  if (os.type().indexOf('Windows') > -1) {
    handleCommands(false);
  } else if (os.type().indexOf('Windows') < 0) {
    handleCommands(true);
  }
}