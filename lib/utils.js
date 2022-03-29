'use strict';

/**
 * This source code is licensed under MIT.
 */

const os = require('os');
const fs = require('fs');
const path = require('path');
const config = require('./configs');
const username = os.userInfo().username;
const Windows_PATH = config.windowsPath;
const scriptName = 'start_script';
const Linux_Project_Tag = '#Project__';
const Cron_Warning = 'no crontab';
const nodePath = os.type().indexOf('Darwin') > -1 ? config.macNodePath : 'node';
const BASE_PATH = config.BASE_PATH;
const List_File_Path = 'project_list.txt';

function getProjectTag(projectName) {
  return `${Linux_Project_Tag}${projectName}`;
};

class utils {
  constructor() {
    this.getCronContent = function (projectPath, envVars) {
      return `\n@reboot ${envVars.split(',').join(' ')} ${nodePath} ${path.resolve(projectPath)}\n`;
    };

    this.getBootScriptPath = function (isLinux, projectName) {
      return isLinux ? `${BASE_PATH}/${os.type()}_${username}_${projectName}_${scriptName}` : os.homedir() + `${Windows_PATH}${projectName}_${scriptName}.vbs`;
    };

    this.formatError = function (error) {
      return error && error.indexOf('must be privileged to use') > -1 ? 'Please re-run this command as a `sudo` user' : error;
    };

    this.getProjectTag = getProjectTag;

    this.getEnvVariables = function (isLinux, envVariables) {
      let envString = '';
      if (envVariables && envVariables.length > 0) {
        let envList = envVariables.split(',');
        for (let i = 0; i < envList.length; i++) {
          if (envList[i].indexOf('=') > -1 && envList[i].split('=')[1]) {
            if (isLinux && envString.length > 0) {
              envString += ',';
            }
            envString += isLinux ? `${envList[i]}` : `processVar("${envList[i].split('=')[0]}") = "${envList[i].split('=')[1]}"\n`;
          }
        }
      }

      return envString;
    };

    this.isValidCronErr = function (cronErr) {
      return cronErr && cronErr.indexOf(Cron_Warning) < 0
    };

    this.getScriptIndex = function (projectName, cronContent) {
      let scriptTag = getProjectTag(projectName);
      let scriptIndex = -1;
      for (let i = 0; i < cronContent.length; i++) {
        if (cronContent[i].indexOf(scriptTag) > -1) {
          scriptIndex = i;
        }
      }
      return scriptIndex;
    };

    this.updateProjectList = function (projectName, insert) {
      if (!fs.existsSync(path.resolve(BASE_PATH, List_File_Path))) {
        fs.writeFileSync(path.resolve(BASE_PATH, List_File_Path), '');
      }

      let existingList = fs.readFileSync(path.resolve(BASE_PATH, List_File_Path)).toString();
      if (insert) {
        let content = existingList && existingList.length > 0 ? '\n' + projectName : projectName;
        fs.appendFileSync(path.resolve(BASE_PATH, List_File_Path), content);
      } else {
        existingList = existingList.split(projectName.toString().trim()).join(' ');
        existingList = existingList.split('\n').filter(function (obj) {
          return obj && obj.trim().length > 0;
        });
        fs.writeFileSync(path.resolve(BASE_PATH, List_File_Path), existingList.toString().split(',').join('\n'));
      }
    };

    this.getProjects = function () {
      let listPath = path.resolve(BASE_PATH, List_File_Path);
      let projectList = fs.existsSync(listPath) ? fs.readFileSync(listPath) : null;
      if (projectList && projectList.toString().length > 0) {
        return { list: fs.readFileSync(path.resolve(BASE_PATH, List_File_Path)).toString() };
      }

      return { err: 'There is no project enabled with boot-start.' };
    };

    this._
  }
}

module.exports = utils;