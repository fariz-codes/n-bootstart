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
const getExecutionCmd = utilFunc.getExecutionCmd;
const getProjectInfo = utilFunc.getProjectInfo;

function status(projectName) {
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

class scripts {
  constructor() {
    /**
     * Enable boot-start for a project
     * @param {String} projectName 
     * @param {String} projectPath 
     * @param {String} envVariables - Format : key1=value1,key2=value2
     * @returns {Object} err, status
     */
    this._enable = function (projectName, projectPath, envVariables) {
      const isLinux = os.type().indexOf('Windows') < 0 ? true : false;
      let scriptStatus = status(projectName);
      if (scriptStatus.status) {
        const err = `A script already exists with the same name.`;
        return { status: false, err };
      }
      if (!fs.existsSync(projectPath)) {
        return { status: false, err: `Incorrect project path - '${projectPath}'.` };
      }
      let bootScriptPath = getBootScriptPath(isLinux, projectName);
      let envVars = getEnvVariables(isLinux, envVariables);
      let executionCmd = getExecutionCmd(envVariables);
      let projectInfo = getProjectInfo(isLinux, projectPath);

      if (projectInfo && projectInfo.err) {
        return { status: false, err: projectInfo.err };
      }

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
        let scriptContent = getCronContent(projectInfo, envVars, executionCmd);
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
        fs.writeFileSync(bootScriptPath, `Set ObjShell = CreateObject("Wscript.Shell")\nSet processVar = ObjShell.Environment("process")\n${envVars}path = "${projectInfo.directory}"\nstartfile = "${projectInfo.startFile}"\nObjShell.Run "cmd.exe /S /C cd """ & path & """ & ${executionCmd} ${projectInfo.startFile}""", 0`);
      }
      updateProjectList(projectName, true);

      return { status: true };
    };

    /**
     * Disable boot-start for a project
     * @param {String} projectName 
     * @returns {Object} err, status
     */
    this._disable = function (projectName) {
      const isLinux = os.type().indexOf('Windows') < 0 ? true : false;
      let scriptStatus = status(projectName);
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
          let updatedCronContent = '';

          if (scriptIndex > -1) {
            cronContent.splice(scriptIndex, 2);
          }

          for (let i = 0; i < cronContent.length; i++) {
            if (updatedCronContent.length > 0) {
              updatedCronContent += '\n';
            }
            if (cronContent[i].trim().length > 0) {
              updatedCronContent += cronContent[i];
            }
          }

          fs.writeFileSync(path.resolve(bootScriptPath), updatedCronContent);
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

    /**
     * View the configured information for a project
     * @param {String} projectName 
     * @returns {Object} err, status, path, envVars, startfile
     */
    this._view = function (projectName) {
      const isLinux = os.type().indexOf('Windows') < 0 ? true : false;
      const err = `No content found for the mentioned project.`;
      let scriptStatus = status(projectName);
      if (!scriptStatus.status) {
        return { status: false, err };
      }
      let path = '', envVars = '', startfile = '';
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
          if (scriptContent[i].indexOf('path = ') > -1) {
            path = scriptContent[i].split('path = ')[1].trim().replace('"', '');
          }
          if (scriptContent[i].indexOf('startfile = ') > -1) {
            startfile = scriptContent[i].split('startfile = ')[1].trim();
          }
          if (path === '' && scriptContent[i].indexOf('ObjShell.Run') > -1) {
            let content = scriptContent[i].split('node');
            content = content && content.length > 0 ? content[content.length - 1] : '';
            path = content && content.indexOf('"') > -1 ? content.split('"')[0].trim() : '';
          }
        }
        return {
          status: true, path, startfile, envVars
        }
      }

      return { status: false, err };
    };

    /**
     * List all the configured projects
     * @returns {Object} list, err
     */
    this._list = function () {
      let result = listProjects();

      if (result && result.list) {
        let projects = result.list.split('\n');
        projects = projects.filter(function (project) {
          return project.toString().trim().length > 0;
        });
        for (let i = 0; i < projects.length; i++) {
          let index = parseInt(i) + 1;
          projects[i] = `${index}. ${projects[i]}`;
        }
        result.list = projects.toString().split(',').join('\n');
      }
      return result;
    };
  }
};

module.exports = scripts;