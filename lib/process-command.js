'use strict';

/**
 * This source code is licensed under MIT.
 */

const scripts = require('../lib/script');
const bootStart = new scripts();

function handleCommands() {
  switch (true) {
    case process.argv.slice(2)[0].toString().trim() === 'add':
      let addName = process.argv.slice(3)[0];
      let addPath = process.argv.slice(4)[0];
      let addResult = bootStart._enable(addName, addPath);
      if (addResult && addResult.err) {
        console.log(`Failed to enable boot-start for the project - '${addName}'. ${addResult.err}`);
      } else {
        console.log(`Successfully enabled boot-start for the project - '${addName}'`);
      }
      break;
    case process.argv.slice(2)[0].toString().trim() === 'remove':
      let removeName = process.argv.slice(3)[0];
      let removeResult = bootStart._disable(removeName);
      if (removeResult && removeResult.err) {
        console.log(`Failed to disable boot-start for the project - '${removeName}'. ${removeResult.err}`);
      } else {
        console.log(`Successfully disabled boot-start for the project - '${removeName}'`);
      }
      break;
    case process.argv.slice(2)[0].toString().trim() === 'view':
      let viewName = process.argv.slice(3)[0];
      let viewResult = bootStart._view(viewName);
      if (viewResult && viewResult.err) {
        console.log(`Failed to view the content for the project - '${viewName}'. ${viewResult.err}`);
      } else {
        console.log(`Path configured for '${viewName}' is... ${viewResult.content}`);
      }
      break;
  };

}

handleCommands();

