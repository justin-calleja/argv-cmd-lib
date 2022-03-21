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
export type NamedItem<T> = [name: string, item: T];

/**
 * Used to attach a number (index) to a given data structure T.
 */
export type IndexedItem<T> = [index: number, item: T];

/**
 * Used to determine if a Cmd is a ParsedCmd.
 */
export function isParsedCmd(cmd: Cmd | ParsedCmd): cmd is ParsedCmd {
  return (
    typeof cmd.name === 'string' && 'argv' in cmd && Array.isArray(cmd.argv)
  );
}

/**
 * You should pass in your root command and `process.argv.slice(2)`.
 *
 * The returned ParsedCmd can be used with other functions to determine which command your app should run.
 *
 * Throws if the given command (or any of its sub commands) is missing a name.
 */
export function parseCmdOrThrow(
  // NOTE: unfortunately, Partial<Cmd> does not make cmd.subCmds also of type Partial<Cmd> i.e.
  // cmd.subCmds can be undefined but if it's not, then it's a Cmd[] not a Partial<Cmd>[]...
  { name, subCmds }: Partial<Cmd>,
  argv: string[] = [],
): ParsedCmd {
  if (name === undefined) {
    throw new Error("A command's name is required.");
  }

  return _parseCmdOrThrow({ name, subCmds: subCmds ?? [] }, argv);
}

function _parseCmdOrThrow(cmd: Cmd, argv: string[]): ParsedCmd {
  const [indexOfFirstSubCmdInArgv, firstSubCmdInArgv] = getFirstIndexedCmd(
    cmd.subCmds,
    argv,
  );

  if (firstSubCmdInArgv === undefined) {
    return { ...cmd, argv };
  }

  // This cmd's parsing should only consider till the subCmd:
  const cmdArgv = argv.slice(0, indexOfFirstSubCmdInArgv);
  const subCmdArgv = argv.slice(indexOfFirstSubCmdInArgv + 1);

  // use parseCmdOrThrow (not _parseCmdOrThrow) to ensure firstSubCmdInArgv is a valid Cmd:
  const parsedSubCmd = parseCmdOrThrow(firstSubCmdInArgv, subCmdArgv);

  // NOTE: not using tail recursion (but engine would have to support it anyway).
  // Stack will keep growing but not expecting a lot of recursion.
  // Too many sub-commands will make your cli app unusable anyway.

  return {
    ...cmd,
    subCmds: cmd.subCmds.map((subCmd) =>
      subCmd.name === parsedSubCmd.name ? parsedSubCmd : subCmd,
    ),
    argv: cmdArgv,
  };
}

/**
 * Same as parseCmdOrThrow but returns a string describing the error instead of throwing.
 */
export function parseCmd(
  partialCmd: Partial<Cmd>,
  argv: string[] = [],
): ParsedCmd | string {
  try {
    return parseCmdOrThrow(partialCmd, argv);
  } catch (err) {
    if (err instanceof Error) {
      return err.message;
    }
    return 'Caught unknown error.';
  }
}

/**
 * Returns the first Cmd to match in given `argv` grouped with its index in `argv`.
 */
export function getFirstIndexedCmd(
  cmds: Cmd[],
  argv: string[],
): IndexedItem<Cmd | undefined> {
  return cmds
    .map((cmd): [number, Cmd] => [argv.indexOf(cmd.name), cmd])
    .filter(([indexOfSubCmdNameInArgv]) => indexOfSubCmdNameInArgv !== -1)
    .reduce(
      (
        acc: [number, Cmd | undefined],
        curr: [number, Cmd],
      ): [number, Cmd | undefined] => {
        if (acc[0] === -1) {
          return curr;
        }

        if (curr[0] < acc[0]) {
          acc = curr;
        }

        return acc;
      },
      [-1, undefined],
    );
}

/**
 * Returns a list of parsed command names.
 *
 * You can get the fully qualified name of the last matched command (the one to run)
 * by joining these names with '.' (the default separator; or any other separator you're using).
 */
export function getParsedCmdNames(cmd: ParsedCmd): string[] {
  return _getParsedCmdNames(cmd, []);
}

function _getParsedCmdNames(parsedCmd: ParsedCmd, acc: string[]): string[] {
  const parsedSubCmd = parsedCmd.subCmds.find(isParsedCmd);

  return parsedSubCmd === undefined
    ? [...acc, parsedCmd.name]
    : _getParsedCmdNames(parsedSubCmd, [...acc, parsedCmd.name]);
}

/**
 * Returns a list of all `argv`s which where parsed out of the original `process.argv`, grouped with
 * the fully qualified name of the command that matched.
 *
 * Each command's `argv` can now be further processed to parse its options with an option parsing library
 * like minimist.
 */
export function getNamedArgvs(
  parsedCmd: ParsedCmd,
  separator: string = '.',
): NamedItem<string[]>[] {
  return _getNamedArgvs(parsedCmd, separator, []);
}

function _getNamedArgvs(
  parsedCmd: ParsedCmd,
  separator: string,
  acc: NamedItem<string[]>[],
): NamedItem<string[]>[] {
  const parsedSubCmd = parsedCmd.subCmds.find(isParsedCmd);

  const fullyQualifiedCmdName =
    acc.length === 0
      ? parsedCmd.name
      : `${acc.slice(-1)[0][0]}${separator}${parsedCmd.name}`;

  const namedArgv: NamedItem<string[]> = [
    fullyQualifiedCmdName,
    parsedCmd.argv,
  ];

  return parsedSubCmd === undefined
    ? [...acc, namedArgv]
    : _getNamedArgvs(parsedSubCmd, separator, [...acc, namedArgv]);
}
