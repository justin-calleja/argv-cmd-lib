`argv-cmd-lib` is a library with functions to help you write a command line app which supports multiple commands.

## Install

```sh
npm i argv-cmd-lib
```

## Exported API

NOTE: read [usage](#usage) for a walk through on using the API to parse a cli app's commands.

```ts
/**
 * Describes a command supported by your cli and its sub commands.
 */
export interface Cmd {
  name: string;
  subCmds: Cmd[];
}

/**
 * Same as Cmd but with the relevant portion of `process.argv` attached.
 * Sub commands may or may not match the given `process.argv`.
 */
export interface ParsedCmd extends Cmd {
  subCmds: (Cmd | ParsedCmd)[];
  argv: string[];
}

/**
 * Used to attach a string (name) to a given data structure T.
 */
export declare type NamedItem<T> = [name: string, item: T];

/**
 * Used to attach a number (index) to a given data structure T.
 */
export declare type IndexedItem<T> = [index: number, item: T];

/**
 * Used to determine if a Cmd is a ParsedCmd.
 */
export declare function isParsedCmd(cmd: Cmd | ParsedCmd): cmd is ParsedCmd;

/**
 * You should pass in your root command and `process.argv.slice(2)`.
 *
 * The returned ParsedCmd can be used with other functions to determine which command your app should run.
 *
 * Throws if the given command or any of its sub commands is missing a name.
 */
export declare function parseCmdOrThrow(
  { name, subCmds }: Partial<Cmd>,
  argv?: string[],
): ParsedCmd;

/**
 * Same as parseCmdOrThrow but returns a string describing the error instead of throwing.
 */
export declare function parseCmd(
  partialCmd: Partial<Cmd>,
  argv?: string[],
): ParsedCmd | string;

/**
 * Returns the first Cmd to match in given `argv` grouped with its index in `argv`.
 */
export declare function getFirstIndexedCmd(
  cmds: Cmd[],
  argv: string[],
): IndexedItem<Cmd | undefined>;

/**
 * Returns a list of parsed command names.
 *
 * You can get the fully qualified name of the last matched command (the one to run)
 * by joining these names with '.' (the default separator; or any other separator you're using).
 */
export declare function getParsedCmdNames(cmd: ParsedCmd): string[];

/**
 * Returns a list of all `argv`s which where parsed out of the original `process.argv`, grouped with
 * the fully qualified name of the command that matched.
 *
 * Each command's `argv` can now be further processed to parse its options with an option parsing library
 * like minimist.
 */
export declare function getNamedArgvs(
  parsedCmd: ParsedCmd,
  separator?: string,
): NamedItem<string[]>[];
```

## Usage

This section walks you through the creation of a demo cli app to illustrate the use of the package's main API. How you structure your app is up to you. This is just one approach and it may not directly apply depending on the relationships between your commands.

The full example can be found in this repo's [./example-adhoc](./example-adhoc) directory.

### Define your cli's supported commands

Lets assume we'd like a cli app that looks something like this:

```md
$ adhoc <argv> <sub-cmd-lvl-1> <argv> <sub-cmd-lvl-2> <argv> <sub-cmd-lvl-3> <argv>
```

… where:

- `<sub-cmd-lvl-1>` can be either `server` or `config` (whichever comes first).
- `<sub-cmd-lvl-2>` depends on what `<sub-cmd-lvl-1>` matched. If it was `server`, then `lvl-2` can match `start` or `stop`. If it was `config`, then it can only match `watch`.
- `<sub-cmd-lvl-3>` again depends on `lvl-2`. If that was `watch` then `start` can match.

Each matched command will get it's own `argv` based on what remains unmatched in `process.argv` after parsing itself out of the equation. These `argv` are what you can choose to continue parsing with something like [minimist](https://www.npmjs.com/package/minimist).

In the [./example-adhoc](./example-adhoc) directory, you can find the definition of each command but we'll only discuss the root command here (the rest are structured identically):

```js
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

const run = (argvLookup) => {
  console.log(`Running ${fqn}...`);
  const parsedArgs = parseArgv(argvLookup[fqn]);
  console.log(chalk.blue('parsedArgs:'), JSON.stringify(parsedArgs, null, 2));
};

module.exports = {
  name,
  fqn,
  subCmds,
  parseArgv,
  run,
};
```

Here, we are defining:

1. The command's `name`
1. The command's `fqn`, or "fully qualified name". For the root command, it's just the name, but sub-commands will include their parent's command names here e.g. `'adhoc.server.start'`.
1. The command's `subCmds`, required from other modules (important: make sure to only require sub-commands, and not parent commands to avoid cyclic dependencies). That is for e.g. why I don't require parent modules to get their name when defining `fqn`. If you require shared code between command definitions (including parents), you can always define this code in a separate module e.g. `utilities` or `cmdFqns` or something and each command would require it. This avoids cyclic dependencies.
1. The command's `parseArgv` i.e. the function it will use to parse the portion of `process.argv` that is relevant to it. Using `minimist` here but, of course, any cli option parser can be used (or even a combination if a particular command requires a feature only supported in a parser X for e.g.).
1. The command's `run` function i.e. what will run if this command is what ends up matching.

### Parse the root command

You can now require the root command and parse it:

```js
const { parseCmdOrThrow } = require('argv-cmd-lib');
const adhocCmd = require('./cmds/adhoc');

const parsedCmd = parseCmdOrThrow(
  adhocCmd,
  // You need to pass in the string[] to parse yourself.
  // argv-cmd-lib has no references to `process.argv` internally (and no node dependencies) so it's TS src files should work in deno too (haven't tried it though).
  // (It also uses a single src/index.ts with no imports to avoid the file suffix problem).
  process.argv.slice(2),
);
```

A `parsedCmd` is just the same data structure you passed in to `parseCmdOrThrow` (`adhocCmd` in this case) but with an additional property of `argv` attached at each level of successfully parsed command (i.e. if lower level commands aren't present in `process.argv`, then they won't get an `argv` property).

### An example of parsedCmd

To better illustrate this, consider a `process.argv.slice(2)` of:

```js
[
  '-v',
  'start',
  'server',
  'something',
  'config',
  'start',
  'watch',
  '-p',
  '3000',
];
```

This will get split up as follows amongst the matching commands:

```js
const parsedCmd = {
  name: 'adhoc',
  argv: ['-v', 'start'],
  subCmds: [
    // identical copy of unparsed configCmd:
    configCmd,
    {
      name: 'server',
      argv: ['something', 'config'],
      subCmds: [
        {
          name: 'start',
          argv: ['watch', '-p', '3000'],
        },
        // identical copy of unparsed configCmd:
        serverStopCmd,
      ],
    },
  ],
};
```

Since `adhocCmd` has no sub-command named `'start'`, it gets passed in as part of its `argv` instead of matching. Next, `'server'` matches one of `adhocCmd`'s `subCmds` so `adhocCmd`'s `argv` stops there. The rest:

- `serverCmd` has no `'something'` or `'config'` sub commands.
- `serverCmd` has a sub command with name `'start'` so that matches.
- etc…

### How to go from parsedCmd to knowing which command to run

The following illustrates how to go from `process.argv` -> `parsedCmd` -> `fullyQualifiedCmdNameToRun` that represents which command your cli app should run. It also shows how to get a convenient mapping of parsed fully qualified command names to their corresponding `argv`s in case any of your commands require parsing not just their own `argv` but any of their parents too in order to fulfil their task.

```js
const {
  parseCmdOrThrow,
  getParsedCmdNames,
  getNamedArgvs,
} = require('argv-cmd-lib');
const adhocCmd = require('./cmds/adhoc');
const configCmd = require('./cmds/config');
// etc... (require other commands)

const main = () => {
  const parsedCmd = parseCmdOrThrow(adhocCmd, process.argv.slice(2));

  const fullyQualifiedCmdNameToRun = getParsedCmdNames(parsedCmd).join('.');
  const namedArgvs = getNamedArgvs(parsedCmd);
  const argvLookup = Object.fromEntries(namedArgvs);

  switch (fullyQualifiedCmdNameToRun) {
    case adhocCmd.fqn: {
      adhocCmd.run(argvLookup);
      break;
    }
    case configCmd.fqn: {
      configCmd.run(argvLookup);
      break;
    }
    // etc... (define the cases for other supported commands)
    default: {
      throw new Error(
        `Failed to implement command with fully qualified name of: ${fullyQualifiedCmdNameToRun}`,
      );
    }
  }
};

main();
```

### namedargvs

`parsedArgvs` is basically just a grouping of parsed fully qualified command name to `string[]` (i.e. `argv`).

Continuing from the above `parsedCmd` example, `parsedArgvs` would look like:

```js
const parsedArgvs = [
  ['adhoc', ['-v', 'start']],
  ['adhoc.server', ['something', 'config']],
  ['adhoc.server.start', ['watch', '-p', '3000']],
];
```

### What if you want to parse all matched command argvs? e.g. to list unrecognized commands

The approach taken about ends up only parsing the options for the last command to match in `process.argv`. If your app requires parsing all command argvs (because e.g. certain behaviour like logging verbosity or listing of unrecognized commands depends on it), then you can do something like this instead:

```js
  const namedArgvs = getNamedArgvs(parsedCmd);
  const namedParsedArgvs = namedArgvs.map(([fqn, argv]) =>
    fqn === adhocCmd.fqn
      ? [fqn, adhocCmd.parseArgv(argv)]
      : fqn === serverCmd.fqn
      ? [fqn, serverCmd.parseArgv(argv)]
      : fqn === serverStartCmd.fqn
      ? [fqn, serverStartCmd.parseArgv(argv)]
      : fqn === serverStopCmd.fqn
      ? [fqn, serverStopCmd.parseArgv(argv)]
      : fqn === configCmd.fqn
      ? [fqn, configCmd.parseArgv(argv)]
      : fqn === configWatchCmd.fqn
      ? [fqn, configWatchCmd.parseArgv(argv)]
      : fqn === configWatchStartCmd.fqn
      ? [fqn, configWatchStartCmd.parseArgv(argv)]
      : // otherwise, don't parse argv:
        [fqn, argv],
  );

  const parsedArgvLookup = Object.fromEntries(namedParsedArgvs);
```

… and then pass `namedParsedArgvs` to each command instead of the previous version which only passed `namedArgvs` (the yet unparsed `argv`s). The example in [./example-adhoc](./example-adhoc) directory takes this approach.

### Try running example-adhoc/index.js to see the output it prints out

Finally, to get a better idea of the result of parsing `process.argv` in this example app created with `argv-cmd-lib`, try running the following with different command line arguments (note that the built `lib` directory is commited in source control so you don't need to `npm install` the dev dependencies and build the project yourself to run the example. Just clone the repo):

```sh
node ./example-adhoc/index.js put something here -h server start -p 4000
```
