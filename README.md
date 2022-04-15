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

<img src="https://github.com/fariz-codes/npm-images/blob/master/n-bootstart/cli.png?raw=true" alt="CLI Options">

**n-bootstart** is a module that creates a script based on the OS which will run the configured Node JS projects when the system is turned on.

You can also use n-bootstart for a NPM module like pm2/forever/nodemon by passing the environment variables `nboot_npm_name` & `nboot_npm_cmd` when enabling the boot start.

## How it works

- In Windows OS, it will create a vbs file in the startup folder path.

- In Linux based OS, it will add the commands in the user's crontab.

## Using from CLI

- To see the available options

```
n-bootstart
```

- To see the available examples

```
n-bootstart examples
```

## Using from Node JS projects

- Initialize

```
const bootStart = require('n-bootstart');
const bootScripts = new bootStart();
```

- Access functions

```
bootScripts._enable(name, path, envVariables); // Enable boot-start for a project
bootScripts._diable(name);                     // Disable boot-start for a project
bootScripts._view(name);                       // View the configured information for a project
bootScripts._list();                           // List all the configured projects
```

## CHANGELOG

[See Change Logs](https://github.com/fariz-codes/n-bootstart/blob/main/CHANGELOG.md)

## License

n-bootstart is licensed under **MIT**

For any queries or support, **reach us** at (mailto:fariz.codes@gmail.com)