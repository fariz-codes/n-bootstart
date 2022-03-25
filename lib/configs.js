'use strict';

/**
 * This source code is licensed under MIT.
 */

const path = require('path');
const homeDir = require('os').homedir();

module.exports = {
  BASE_PATH: path.resolve(homeDir, '.n_bootstart'),
  windowsPath: '//AppData//Roaming//Microsoft//Windows//Start Menu//Programs//Startup//',
  macNodePath: '/usr/local/bin/node'
};