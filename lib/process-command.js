'use strict';

/**
 * This source code is licensed under MIT.
 */

const { _enable, _disable } = require('../lib/script');

function handleCommands() {
  switch (true) {
    case process.argv.slice(2)[0].toString().trim() === 'add':
      let addName = process.argv.slice(3)[0];
      let addPath = process.argv.slice(4)[0];
      let addResult = _enable(addName, addPath);
      if (addResult && addResult.err) {
        console.log(`Failed to enable boot-start for the project - '${addName}'. ${addResult.err}`);
      } else {
        console.log(`Successfully enabled boot-start for the ${addName} project`);
      }
      break;
    case process.argv.slice(2)[0].toString().trim() === 'remove':
      let removeName = process.argv.slice(3)[0];
      let removeResult = _disable(removeName);
      if (removeResult && removeResult.err) {
        console.log(`Failed to disable boot-start for the project - '${removeName}'. ${removeResult.err}`);
      } else {
        console.log(`Successfully disabled boot-start for the ${removeName} project`);
      }
      break;
  };

}

handleCommands();
