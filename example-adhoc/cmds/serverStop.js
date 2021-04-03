const chalk = require('chalk');
const minimist = require('minimist');
const buildOptions = require('minimist-options');

const name = 'stop';

const fqn = 'adhoc.server.stop';

const subCmds = [];

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
