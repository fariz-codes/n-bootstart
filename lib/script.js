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
const utils = require('./utils');
const utilFunc = new utils();

if (!fs.existsSync(BASE_PATH)) {
  fs.mkdirSync(BASE_PATH);
}

const getCronContent = utilFunc.getCronContent;
const getBootScriptPath = utilFunc.getBootScriptPath;
const formatError = utilFunc.formatError;
const getProjectTag = utilFunc.getProjectTag;
const getEnvVariables = utilFunc.getEnvVariables;
const isValidCronErr = utilFunc.isValidCronErr;
const getStringIndex = utilFunc.getStringIndex;
const updateProjectList = utilFunc.updateProjectList;
const listProjects = utilFunc.getProjects;

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
        if (isValidCronErr(cronErr)) {
          return { err: formatError(cronErr), status: false };
        } else if (cronContent.indexOf(`${getProjectTag(projectName)}_`) > -1) {
          return { status: true };
        }
      } else if (fs.existsSync(bootScriptPath)) {
        return { status: true };
      }

      return { status: false };
    };

    /**
     * 
     * @param {String} projectName 
     * @param {String} projectPath 
     * @param {String} envVariables - Format : key1=value1,key2=value2
     * @returns 
     */
    this._enable = function (projectName, projectPath, envVariables) {
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
      let envVars = getEnvVariables(isLinux, envVariables);
      if (isLinux) {
        let existingCron = spawnSync('crontab', ['-u', username, '-l'], {
          detached: true
        });
        let cronContent = existingCron.stdout.toString();
        let cronListErr = existingCron.stderr.toString();
        if (isValidCronErr(cronListErr)) {
          return { err: formatError(cronListErr), status: false };
        }
        if (!cronContent || cronContent.toString().length < 1) {
          cronContent = '';
        }
        let scriptContent = getCronContent(projectPath, envVars);
        if (cronContent.indexOf(`${getProjectTag(projectName)}_`) < 0) {
          cronContent += `\n${getProjectTag(projectName)}_${envVars} ${projectPath}${scriptContent}`;
        }

        fs.writeFileSync(path.resolve(bootScriptPath), cronContent);
        let addCron = spawnSync('crontab', ['-u', username, path.resolve(bootScriptPath)], {
          detached: true
        });
        let cronErr = addCron.stderr.toString();

        if (isValidCronErr(cronErr)) {
          return { err: formatError(cronErr), status: false };
        }
      } else {
        fs.writeFileSync(bootScriptPath, `Set ObjShell = CreateObject("Wscript.Shell")\nSet processVar = ObjShell.Environment("process")\n${envVars}ObjShell.Run "node ${path.resolve(projectPath)}", 0`);
      }
      updateProjectList(projectName, true);

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
        let cronContent = existingCron.stdout.toString();
        let cronListErr = existingCron.stderr.toString();
        if (isValidCronErr(cronListErr)) {
          return { err: formatError(cronListErr), status: false };
        }
        if (cronContent && cronContent.length > 0) {
          cronContent = cronContent.split('\n');
          let scriptTag = getProjectTag(projectName);
          let scriptIndex = getStringIndex(`${scriptTag}_`, cronContent);

          if (scriptIndex > -1) {
            cronContent.splice(scriptIndex, scriptIndex + 2);
          }
          fs.writeFileSync(path.resolve(bootScriptPath), cronContent.toString().split(',').join('\n'));
          let addCron = spawnSync('crontab', ['-u', username, path.resolve(bootScriptPath)], {
            detached: true
          });
          let cronErr = addCron.stderr.toString();

          if (isValidCronErr(cronErr)) {
            return { err: formatError(cronErr), status: false };
          }
        }
      } else {
        fs.unlinkSync(bootScriptPath)
      }
      updateProjectList(projectName);

      return { status: true };
    };

    this._view = function (projectName) {
      const isLinux = os.type().indexOf('Windows') < 0 ? true : false;
      const err = `No content found for the mentioned project.`;
      let scriptStatus = this._status(projectName);
      if (!scriptStatus.status) {
        return { status: false, err };
      }
      let path = '', envVars = '';
      let bootScriptPath = getBootScriptPath(isLinux, projectName);
      if (isLinux) {
        let existingCron = spawnSync('crontab', ['-u', username, '-l'], {
          detached: true
        });
        let cronContent = existingCron.stdout.toString();
        let cronListErr = existingCron.stderr.toString();
        if (isValidCronErr(cronListErr)) {
          return { err: formatError(cronListErr), status: false };
        }
        cronContent = cronContent.split('\n');
        let scriptTag = getProjectTag(projectName);
        let scriptIndex = getStringIndex(`${scriptTag}_`, cronContent);
        if (scriptIndex > -1) {
          path = cronContent[scriptIndex].split(' ')[1];
          let projectTag = `${getProjectTag(projectName)}_`;
          envVars = cronContent[scriptIndex].split(projectTag);
          if (envVars && envVars[1]) {
            envVars = envVars[1].split(' ')[0];
          } else {
            envVars = '';
          }
          return { status: true, path, envVars };
        }
      } else {
        let scriptContent = fs.readFileSync(bootScriptPath).toString().split('\n');
        for (let i = 0; i < scriptContent.length; i++) {
          if (scriptContent[i].indexOf('processVar(') > -1) {
            scriptContent[i] = scriptContent[i].split('"').join('');
            let key = scriptContent[i].split('=')[0];
            key = key.split('(')[1];
            key = key.split(')')[0];
            let value = scriptContent[i].split('=')[1] ? scriptContent[i].split('=')[1].trim() : '';
            if (envVars.length > 0) {
              envVars += ','
            }
            envVars += `${key}=${value}`;
          }
          if (scriptContent[i].indexOf('ObjShell.Run') > -1) {
            let content = scriptContent[i].split('node');
            content = content && content.length > 0 ? content[content.length - 1] : '';
            path = content && content.indexOf('"') > -1 ? content.split('"')[0].trim() : '';
          }
        }
        return {
          status: true, path, envVars
        }
      }

      return { status: false, err };
    };

    this._list = function () {
      let result = listProjects();

      if (result && result.list) {
        let projects = result.list.split('\n');
        for (let i = 0; i < projects.length; i++) {
          let index = parseInt(i) + 1;
          projects[i] = `${index}. ${projects[i]}`;
        }
        result.list = projects.toString().split(',').join('\n');
      }
      return result;
    };

    this._getDottedLines = function (count) {
      let lines = '';
      for (let i = 0; i < count; i++) {
        lines += '-'
      }

      return lines;
    };
  }
};

module.exports = scripts;