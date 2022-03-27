function removeLastNChars(str: string, n: number) {
  return str.slice(0, -n);
}

function createRegexpStr(subCmds: string) {
  return `^[ \t]*(.*?)[ \t]*(${subCmds})[ \t]*(.*?)[ \t]*$`;
}

export type CmdArgv = [pathToCmd: string, argv: string[]];

export type Opts = {
  ext?: string;
  pathSeparator?: string;
  rootCmd?: string;
  basePath?: string;
};

export function groupArgvByCmds(
  argv: string[],
  cmdPaths: string[],
  {
    ext = '.js',
    pathSeparator = '/',
    rootCmd = 'index',
    basePath = '.',
  }: Opts = {},
): CmdArgv[] {
  const argvStr = argv.join(' ');
  const cmdTable: string[][] = cmdPaths.map((path) =>
    removeLastNChars(path, ext.length).split(pathSeparator),
  );

  if (cmdTable.length === 0) {
    return [
      [rootCmd === '' ? basePath : `${basePath}${pathSeparator}${rootCmd}`, []],
    ];
  }

  return _groupArgvByCmds(
    0,
    argvStr,
    cmdTable,
    basePath,
    pathSeparator,
    rootCmd,
  );
}

function _groupArgvByCmds(
  colIndex: number,
  argvStr: string,
  cmdTable: string[][],
  cmdToRunBasePath: string,
  pathSeparator: string,
  cmdToRun: string,
  result: CmdArgv[] = [],
): CmdArgv[] {
  const subCmdsSet = new Set();
  for (let rowIndex = 0; rowIndex < cmdTable.length; rowIndex++) {
    subCmdsSet.add(cmdTable[rowIndex][colIndex]);
  }
  const regexpStr = createRegexpStr(
    Array.from(subCmdsSet).filter(Boolean).join('|'),
  );
  const regexp = new RegExp(regexpStr);
  const regexpResult = regexp.exec(argvStr);

  if (regexpResult === null) {
    result.push([
      cmdToRun === ''
        ? cmdToRunBasePath
        : `${cmdToRunBasePath}${pathSeparator}${cmdToRun}`,
      argvStr.split(' ').filter(Boolean),
    ]);
    return result;
  }

  const [_, cmdToRunArgvStr, subCmd, remainingArgvStr] = regexpResult;
  if (cmdToRunArgvStr !== undefined) {
    result.push([
      cmdToRun === ''
        ? cmdToRunBasePath
        : `${cmdToRunBasePath}${pathSeparator}${cmdToRun}`,
      cmdToRunArgvStr.split(' ').filter(Boolean),
    ]);
    return _groupArgvByCmds(
      colIndex + 1,
      remainingArgvStr,
      cmdTable,
      `${cmdToRunBasePath}${pathSeparator}${subCmd}`,
      pathSeparator,
      '',
      result,
    );
  }

  return result;
}
