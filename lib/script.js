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
const BASE_PATH = config.BASE_PATH;
const nodePath = os.type().indexOf('Darwin') > -1 ? config.macNodePath : 'node';
const BASE_DIR_PATH = path.resolve(os.homedir(), BASE_PATH);
const Windows_PATH = config.windowsPath;
const scriptName = 'start_script';

if (!fs.existsSync(BASE_DIR_PATH)) {
  fs.mkdirSync(BASE_DIR_PATH);
}

function getCronContent(projectPath) {
  return `\n@reboot ${nodePath} ${path.resolve(projectPath)}\n`;
};

function getBootScriptPath(isLinux, projectName) {
  return isLinux ? `${BASE_PATH}/${os.type()}_${username}_${projectName}_${scriptName}` : os.homedir() + `${Windows_PATH}${projectName}_${scriptName}.vbs`;
};

class scripts {
  constructor() {
    this._status = function (projectName) {
      const isLinux = os.type().indexOf('Windows') < 0 ? true : false;
      let bootScriptPath = getBootScriptPath(isLinux, projectName);
      if (isLinux) {
        let existingCron = spawnSync('crontab', ['-u', username, '-l'], {
          detached: true
        });
        let cronContent = existingCron.stdout.toString();
        let cronErr = existingCron.stderr.toString();

        if (cronErr) {
          return { err: cronErr, status: false };
        } else if (cronContent.indexOf(getCronContent(fs.readFileSync(bootScriptPath))) > -1) {
          return { status: true };
        }
      } else if (fs.existsSync(bootScriptPath)) {
        return { status: true };
      }

      return { status: false };
    };

    this._enable = function (projectName, projectPath) {
      const isLinux = os.type().indexOf('Windows') < 0 ? true : false;
      let scriptStatus = this._status(projectName);
      if (scriptStatus.status) {
        const err = `A script already exists with the same name.`;
        return { status: false, err };
      }
      if (!fs.existsSync(projectPath)) {
        return { status: false, err: `Incorrect project path - '${projectPath}'.` };
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
        cronContent += getCronContent(projectPath);
        fs.writeFileSync(path.resolve(bootScriptPath), cronContent);
        let addCron = spawnSync('crontab', ['-u', username, path.resolve(bootScriptPath)], {
          detached: true
        });
        let cronErr = addCron.stderr.toString();

        if (cronErr) {
          return { err: cronErr, status: false };
        }
      } else {
        fs.writeFileSync(bootScriptPath, `CreateObject("Wscript.Shell").Run "node ${path.resolve(projectPath)}", 0`);
      }
      return { status: true };
    };

    this._disable = function (projectName) {
      const isLinux = os.type().indexOf('Windows') < 0 ? true : false;
      let scriptStatus = this._status(projectName);
      if (!scriptStatus.status) {
        const err = `No script found for the mentioned project.`;
        return { status: false, err };
      }
      let bootScriptPath = getBootScriptPath(isLinux, projectName);
      if (isLinux) {
        let existingCron = spawnSync('crontab', ['-u', username, '-l'], {
          detached: true
        });
        let cronFileContent = getCronContent(fs.readFileSync(bootScriptPath));
        let cronContent = existingCron.stdout.toString();
        if (cronContent && cronContent.indexOf(cronFileContent) > -1) {
          cronContent = cronContent.replace(cronFileContent, '');
          fs.writeFileSync(path.resolve(bootScriptPath), cronContent);
          let addCron = spawnSync('crontab', ['-u', username, path.resolve(bootScriptPath)], {
            detached: true
          });
          let cronErr = addCron.stderr.toString();

          if (cronErr) {
            return { err: cronErr, status: false };
          }
        }
      } else {
        fs.unlinkSync(bootScriptPath)
      }
      return { status: true };
    };

    this._view = function (projectName) {
      const isLinux = os.type().indexOf('Windows') < 0 ? true : false;
      const err = `No script found for the mentioned project.`;
      let scriptStatus = this._status(projectName);
      if (!scriptStatus.status) {
        return { status: false, err };
      }
      if (isLinux) {
        let existingCron = spawnSync('crontab', ['-u', username, '-l'], {
          detached: true
        });
        let cronContent = existingCron.stdout.toString();
        if (cronContent && cronContent.length > 0) {
          return { status: true, content: cronContent };
        }
      } else {
        let bootScriptPath = getBootScriptPath(isLinux, projectName);
        let scriptContent = fs.readFileSync(bootScriptPath).toString();
        let content;
        if (scriptContent && scriptContent.indexOf('node') > -1) {
          scriptContent = scriptContent.split('node');
          scriptContent = scriptContent && scriptContent.length > 0 ? scriptContent[scriptContent.length - 1] : '';
          content = scriptContent && scriptContent.indexOf('"') > -1 ? scriptContent.split('"')[0].trim() : '';
        }
        return {
          status: true, content
        }
      }

      return { status: false, err };
    };
  }
};

module.exports = scripts;