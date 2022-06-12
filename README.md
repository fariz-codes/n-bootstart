# n(node)-bootstart
**A script to start Node JS projects when the system boots up**

[![npm Downloads](https://img.shields.io/npm/dm/n-bootstart.svg?style=flat-square)](https://www.npmjs.com/package/n-bootstart)
[![npm Downloads](https://img.shields.io/npm/dy/n-bootstart.svg?style=flat-square)](https://www.npmjs.com/package/n-bootstart)

## Installation

1. Install as a global package to access it from the CLI.

```
npm i n-bootstart -g
```

2. Install as a dependency package to access it inside the Node JS projects.

```
npm i n-bootstart --save
```

## Tested Operating Systems

- Windows 11, Mac Monterey, RHEL 7.9, Ubuntu 20.04, Cent OS 7, Fedora 35

## About

**n-bootstart** is a module to run the configured Node JS projects when the system is turned on.

:pushpin: To configure a project that uses the NPM module like **pm2**/**forever**/**nodemon**, pass the environment variables `nboot_npm_name` & `nboot_npm_cmd` when enabling the boot start.

## How it works

- In Windows OS, it will create a vbs file that contains scripts to start the Node JS project in the startup folder.

- In Linux based OS, it will add the commands to start the Node JS project in the user's crontab.

## Using from CLI

- To see the available options

```
n-bootstart
```

<img src="https://github.com/fariz-codes/npm-images/blob/master/n-bootstart/cli.png?raw=true" alt="CLI Options">

- To see the available examples

```
n-bootstart examples
```

<img src="https://github.com/fariz-codes/npm-images/blob/master/n-bootstart/examples.png?raw=true" alt="CLI Examples">

## Using from Node JS projects

- Initialize

```
const nBootStart = require('n-bootstart');
const nBootScripts = new nBootStart();
```

- Access functions

```
nBootScripts._enable(name, path, envVariables); // Enable boot-start for a project
nBootScripts._diable(name);                     // Disable boot-start for a project
nBootScripts._view(name);                       // View the configured information for a project
nBootScripts._list();                           // List all the configured projects
```

## CHANGELOG

[See Change Logs](https://github.com/fariz-codes/n-bootstart/blob/main/CHANGELOG.md)

## License

n-bootstart is licensed under **MIT**

For any queries or support, **reach us** at (mailto:fariz.codes@gmail.com)