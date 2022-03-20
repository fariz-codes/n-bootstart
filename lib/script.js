'use strict';

/**
 * This source code is licensed under MIT.
 */

const os = require('os');
const fs = require('fs');
const path = require('path');
const username = os.userInfo().username;
const { spawnSync } = require('child_process');
const config = require('./configs');
const CONFIG_PATH = config.CHILD_PROCESS_BASE_CONFIG_PATH;
const nodePath = os.type().indexOf('Darwin') > -1 ? '/usr/local/bin/node' : 'node';
const cronFileContent = `\n@reboot ${nodePath} ${path.resolve(__dirname, '../../bin/server.js')}\n`;

const getBootScriptPath = (isLinux, projectName) => {
  return isLinux ? `${CONFIG_PATH}/${os.type()}_${username}_${projectName
    }_start_script` : os.homedir() + `//AppData//Roaming//Microsoft//Windows//Start Menu//Programs//Startup//${projectName
    }_start_script.vbs`;
};

const getStatus = (isLinux, projectName) => {
  let bootScriptPath = getBootScriptPath(isLinux, projectName);
  if (isLinux) {
    let existingCron = spawnSync('crontab', ['-u', username, '-l'], {
      detached: true
    });
    let cronContent = existingCron.stdout.toString();
    let cronErr = existingCron.stderr.toString();

    if (cronErr) {
      return { err: cronErr, status: false };
    } else if (cronContent.indexOf(cronFileContent) > -1) {
      return { status: true };
    }
  } else if (fs.existsSync(bootScriptPath)) {
    return { status: true };
  }

  return { status: false };
};

const enable = (isLinux, projectName, projectPath) => {
  let scriptStatus = getStatus(isLinux, projectName);
  if (scriptStatus.status) {
    const err = `A script already exists with the same name.`;
    return { status: false, err };
  }
  let bootScriptPath = getBootScriptPath(isLinux, projectName);
  if (isLinux) {
    let existingCron = spawnSync('crontab', ['-u', username, '-l'], {
      detached: true
    });
    let cronContent = existingCron.stdout.toString();
    if (!cronContent || cronContent.toString().length < 1) {
      cronContent = '';
    }
    cronContent += cronFileContent;
    fs.writeFileSync(path.resolve(bootScriptPath), cronContent);
    let addCron = spawnSync('crontab', ['-u', username, path.resolve(bootScriptPath)], {
      detached: true
    });
    let addCronErr = addCron.stderr.toString();

    if (addCronErr) {
      return { err: addCronErr, status: false };
    }
  } else if (!isLinux) {
    fs.writeFileSync(bootScriptPath, `CreateObject("Wscript.Shell").Run "node ${path.resolve(projectPath)}", 0`);
  }
  return { status: true };
}

const disable = (isLinux) => {
  let bootScriptPath = getBootScriptPath(isLinux);
  if (isLinux) {
    let existingCron = spawnSync('crontab', ['-u', username, '-l'], {
      detached: true
    });
    let cronContent = existingCron.stdout.toString();
    if (cronContent && cronContent.indexOf(cronFileContent) > -1) {
      cronContent = cronContent.replace(cronFileContent, '');
      fs.writeFileSync(path.resolve(bootScriptPath), cronContent);
      let addCron = spawnSync('crontab', ['-u', username, path.resolve(bootScriptPath)], {
        detached: true
      });
      let addCronErr = addCron.stderr.toString();

      if (addCronErr) {
        return { err: addCronErr, status: false };
      }
    }
  } else if (fs.existsSync(bootScriptPath)) {
    fs.unlinkSync(bootScriptPath)
  }
  return { status: true };
}

module.exports = {
  getStatus, enable, disable
};