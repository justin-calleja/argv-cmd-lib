const chalk = require('chalk');
const minimist = require('minimist');
const buildOptions = require('minimist-options');
const serverStartCmd = require('./serverStart');
const serverStopCmd = require('./serverStop');

const name = 'server';

const fqn = 'adhoc.server';

const subCmds = [serverStartCmd, serverStopCmd];

const parseArgv = (argv) =>
  minimist(
    argv,
    buildOptions({
      help: {
        type: 'boolean',
        alias: 'h',
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
