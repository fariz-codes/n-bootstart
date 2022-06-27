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
const BASE_PATH = config.BASE_PATH;
const List_File_Path = 'project_list.txt';
const nodePath = os.type().indexOf('Darwin') > -1 ? config.macNodePath + 'node' : 'node';

class utils {
  constructor() { }

  getCronContent(projectInfo, envVars, executionCmd) {
    return `\n@reboot cd ${projectInfo.directory} && ${envVars.split(',').join(' ')} ${executionCmd} ${projectInfo.startFile}\n`;
  };

  getBootScriptPath(isLinux, projectName) {
    return isLinux ? `${BASE_PATH}/${os.type()}_${username}_${projectName}_${scriptName}` : os.homedir() + `${Windows_PATH}${projectName}_${scriptName}.vbs`;
  };

  formatError(error) {
    return error && error.indexOf('must be privileged to use') > -1 ? 'Please re-run this command as a `sudo` user' : error;
  };

  getEnvVariables(isLinux, envVariables) {
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

  isValidCronErr(cronErr) {
    return cronErr && cronErr.indexOf(Cron_Warning) < 0
  };

  updateProjectList(projectName, insert) {
    if (!fs.existsSync(path.resolve(BASE_PATH, List_File_Path))) {
      fs.writeFileSync(path.resolve(BASE_PATH, List_File_Path), '');
    }

    let existingList = fs.readFileSync(path.resolve(BASE_PATH, List_File_Path)).toString();
    if (insert) {
      let content = existingList && existingList.length > 0 ? '\n' + projectName : projectName;
      fs.appendFileSync(path.resolve(BASE_PATH, List_File_Path), content);
    } else {
      let listArray = existingList.split('\n');
      if (listArray && listArray.length > 0) {
        let projectIndex = this.getStringIndex(projectName.toString().trim(), listArray, true);
        if (projectIndex > -1) {
          listArray.splice(projectIndex, 1);
          fs.writeFileSync(path.resolve(BASE_PATH, List_File_Path), listArray.toString().split(',').join('\n'));
        }
      }
    }
  };

  getProjects() {
    let listPath = path.resolve(BASE_PATH, List_File_Path);
    let projectList = fs.existsSync(listPath) ? fs.readFileSync(listPath) : null;
    if (projectList && projectList.toString().length > 0) {
      return { list: fs.readFileSync(path.resolve(BASE_PATH, List_File_Path)).toString() };
    }

    return { err: 'There is no project enabled with boot-start.' };
  };

  _getDottedLines(count) {
    let lines = '';
    for (let i = 0; i < count; i++) {
      lines += '-'
    }

    return lines;
  };

  getExecutionCmd(envVariables) {
    let executionCmd = nodePath;
    if (envVariables && envVariables.length > 0) {
      let envList = envVariables.split(',');
      let name = '', cmd = '';
      for (let i = 0; i < envList.length; i++) {
        if (envList[i].indexOf('nboot_npm_name') > -1 && envList[i].split('=')[1]) {
          name = envList[i].split('=')[1];
        }
        if (envList[i].indexOf('nboot_npm_cmd') > -1 && envList[i].split('=')[1]) {
          cmd = envList[i].split('=')[1];
        }
      }

      if (os.type().indexOf('Darwin') > -1) {
        name = `${config.macNodePath}node ${config.macNodePath + name}`;
      }

      if (name !== '' && cmd !== '') {
        executionCmd = `${name} ${cmd}`;
      }
    }

    return executionCmd;
  };

  getProjectInfo(isLinux, projectPath) {
    const fileDelimiter = isLinux ? '\/' : '\\';
    let splittedPath = path.resolve(projectPath).split(fileDelimiter);
    let directory = isLinux ? fileDelimiter : '';
    let startFile = splittedPath[splittedPath.length - 1];

    for (let i = 0; i < splittedPath.length - 1; i++) {
      if (splittedPath[i].trim().length > 0) {
        if (directory.length > 0 && directory !== fileDelimiter) {
          directory += fileDelimiter;
        }
        directory += splittedPath[i];
      }
    }

    if (!fs.statSync(path.resolve(directory, startFile)).isFile()) {
      return { err: 'Invalid start file.' };
    }

    return { directory, startFile };
  };

  getProjectTag(projectName) {
    return `${Linux_Project_Tag}${projectName}`;
  };

  getStringIndex(searchString, content, exact) {
    let index = -1;
    for (let i = 0; i < content.length; i++) {
      if ((exact && content[i] === searchString) || (!exact && content[i].indexOf(searchString) > -1)) {
        index = i;
      }
    }
    return index;
  };
}

module.exports = utils;