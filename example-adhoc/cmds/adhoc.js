const chalk = require('chalk');
const minimist = require('minimist');
const buildOptions = require('minimist-options');
const configCmd = require('./config');
const serverCmd = require('./server');

const name = 'adhoc';

const fqn = name;

const subCmds = [configCmd, serverCmd];

const parseArgv = (argv) =>
  minimist(
    argv,
    buildOptions({
      debug: {
        type: 'boolean',
        alias: 'd',
        default: false,
      },
      help: {
        type: 'boolean',
        alias: 'h',
        default: false,
      },
      version: {
        type: 'boolean',
        alias: 'v',
        default: false,
      },
    }),
  );

const run = (parsedArgvLookup) => {
  console.log(`Running ${fqn}...`);
};

module.exports = {
  name,
  fqn,
  subCmds,
  parseArgv,
  run,
};
