import createRegexpStrFromSubCmds from './createRegexpStrFromSubCmds.js';

type SubCmd = { path: string; hasChildren: boolean };

export type CmdArgv = [pathToCmd: string, argv: string[]];

export type Opts = {
  ext: string;
  pathSeparator: string;
  indexFile: string;
  basePath: string;
  rootCmdPath: string;
};

const expandSubCmdPath = (opts: Opts, subCmd?: SubCmd) => {
  let cmdPath = `${opts.basePath}${opts.pathSeparator}`;

  if (subCmd?.path === undefined) {
    return `${cmdPath}${opts.rootCmdPath}`;
  }

  cmdPath += subCmd.path;
  cmdPath += subCmd.hasChildren
    ? `${opts.pathSeparator}${opts.indexFile}${opts.ext}`
    : opts.ext;
  return cmdPath;
};

// create cmdTable from cmdPaths, leaving out the rootCmdPath
// or any path that ends with the index file.
const createCmdTable = (cmdPaths: string[], opts: Opts): string[][] => {
  const indexFile = `${opts.indexFile}${opts.ext}`;
  const cmdTable: string[][] = [];
  for (let i = 0; i < cmdPaths.length; i++) {
    const cmdPath = cmdPaths[i];
    if (cmdPath === opts.rootCmdPath || cmdPath.endsWith(indexFile)) {
      continue;
    }
    cmdTable.push(cmdPath.split(opts.pathSeparator));
  }
  return cmdTable;
};

export const defaultOpts: Opts = {
  ext: '.js',
  indexFile: 'index',
  pathSeparator: '/',
  basePath: '.',
  rootCmdPath: 'index.js',
};

export function groupArgvByCmds(
  argv: string[],
  cmdPaths: string[],
  partialOpts: Partial<Opts> = {},
): CmdArgv[] {
  console.log('yes... latest');
  const opts = {
    ...defaultOpts,
    ...partialOpts,
  };

  const cmdTable = createCmdTable(cmdPaths, opts);

  // This is just an "optimisation". If cmdTable.length is 0 it means there's
  // only the root command ro run.
  if (cmdTable.length === 0) {
    return [[`${opts.basePath}${opts.pathSeparator}${opts.rootCmdPath}`, argv]];
  }

  return _groupArgvByCmds(0, argv.join(' '), cmdTable, opts);
}

function _groupArgvByCmds(
  colIndex: number,
  argvStr: string,
  cmdTable: string[][],
  opts: Opts,
  result: CmdArgv[] = [],
  subCmd?: SubCmd,
): CmdArgv[] {
  const currentCmdPath = expandSubCmdPath(opts, subCmd);

  const cmdNamesEndingWithExt: { [cmdName: string]: boolean } = {};
  for (let rowIndex = 0; rowIndex < cmdTable.length; rowIndex++) {
    const cmd = cmdTable[rowIndex][colIndex];
    if (cmd !== undefined) {
      const cmdEndsWithExt = cmd.endsWith(opts.ext);
      cmdNamesEndingWithExt[
        cmdEndsWithExt ? cmd.slice(0, -opts.ext.length) : cmd
      ] = cmdEndsWithExt;
    }
  }

  const regexpStr = createRegexpStrFromSubCmds(
    Object.keys(cmdNamesEndingWithExt),
  );
  const regexp = new RegExp(regexpStr);
  const regexpResult = regexp.exec(argvStr);

  if (regexpResult === null) {
    result.push([currentCmdPath, argvStr.split(' ').filter(Boolean)]);
    return result;
  }

  const [_, cmdArgvAsStr, nextCmd, remainingArgvAsStr] = regexpResult;
  result.push([currentCmdPath, cmdArgvAsStr.split(' ').filter(Boolean)]);
  return _groupArgvByCmds(
    colIndex + 1,
    remainingArgvAsStr,
    cmdTable,
    opts,
    result,
    subCmd === undefined
      ? {
          path: nextCmd,
          hasChildren: !cmdNamesEndingWithExt[nextCmd],
        }
      : {
          path: `${subCmd.path}${opts.pathSeparator}${nextCmd}`,
          hasChildren: !cmdNamesEndingWithExt[nextCmd],
        },
  );
}

export default groupArgvByCmds;
