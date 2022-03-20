'use strict';

/**
 * This source code is licensed under MIT.
 */

const path = require('path');
const homeDir = require('os').homedir();

module.exports = {
  NDA_BASE_PATH: path.resolve(homeDir, '.nda'),
  CHILD_PROCESS_BASE_CONFIG_PATH: path.resolve(homeDir, '.nda/config')
};