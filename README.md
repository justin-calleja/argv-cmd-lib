`argv-cmd-lib` is a library with functions to help you write a command line app which supports multiple commands.

Lets you split your cli app into separate "cmd" files that export e.g. a `run` function to which you pass the portion of `process.argv.slice(2)` that belongs to that sub command.

To do this, you define a directory to house your commands (the `cmdsBasePath`), use a package like `glob` to find all `.js` files within (these are your commands), and then pass `process.argv.slice(2)` and the glob output (the commands your cli support)to `groupArgvByCmds` (exported from this module).

This will give you a `CmdArgv[]` - an array of tuples with the path to the command to run as the first element of each tuple, and an array of args for that command as the second element. See the [usage](#usage) section below for an example.

## Install

```sh
npm i argv-cmd-lib
```

## Exported API

```ts
export declare type CmdArgv = [pathToCmd: string, argv: string[]];
export declare type Opts = {
  ext?: string;
  pathSeparator?: string;
  rootCmd?: string;
  basePath?: string;
};
export declare function groupArgvByCmds(
  argv: string[],
  cmdPaths: string[],
  { ext, pathSeparator, rootCmd, basePath }?: Opts,
): CmdArgv[];
```

## Usage

`src/index.ts`:

```ts
#!/usr/bin/env node

import { join } from 'path';
import glob from 'glob';
import { groupArgvByCmds } from 'argv-cmd-lib';

const cmdsBasePath = join(__dirname, 'cmds');
const files = glob.sync('**/*.js', { cwd: cmdsBasePath });

const groupedArgv = groupArgvByCmds(process.argv.slice(2), files);

export type Ctx = {
  basePath: string;
  outputs: { [cmdPath: string]: any };
};

const ctx: Ctx = {
  basePath: cmdsBasePath,
  outputs: {},
};

for (let [cmdPath, argv] of groupedArgv) {
  console.log('>> cmdPath:', cmdPath, 'argv:', argv);
  const cmd = require(join(cmdsBasePath, cmdPath));
  ctx.outputs[cmdPath] = cmd.run(argv, ctx);
}
```

`src/cmds/index.ts`:

```ts
import type { Ctx } from '..';

import minimist from 'minimist';
import buildOptions from 'minimist-options';

const parseArgv = (argv: string[]) =>
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

export const run = (argv: string[], ctx: Ctx) => {
  const res = parseArgv(argv);
  console.log('in index with parsed args:', res);
  console.log('ctx:', ctx);
  return 'This is index output';
};
```

Similarly in other cmd files e.g. `src/cmds/config/index.ts` or `src/cmds/info.ts` etc…

e.g. with the following commands:

```sh
$ tree src/cmds
src/cmds
├── config
│   └── index.ts
└── index.ts
```

Running with these args `-v config hello world`:

```
$ node lib -v config hello world
>> cmdPath: ./index argv: [ '-v' ]
in index with parsed args: {
  _: [],
  debug: false,
  d: false,
  help: false,
  h: false,
  version: true,
  v: true
}
ctx: { basePath: '/Users/justincalleja/github/sdf/lib/cmds', outputs: {} }
>> cmdPath: ./config argv: [ 'hello', 'world' ]
in config/index with parsed args: {
  _: [ 'hello', 'world' ],
  debug: false,
  d: false,
  help: false,
  h: false,
  version: false,
  v: false
}
ctx: {
  basePath: '/Users/justincalleja/github/sdf/lib/cmds',
  outputs: { './index': 'This is index output' }
}
```
