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
export declare function parseCmdOrThrow({ name, subCmds }: Partial<Cmd>, argv?: string[]): ParsedCmd;
/**
 * Same as parseCmdOrThrow but returns a string describing the error instead of throwing.
 */
export declare function parseCmd(partialCmd: Partial<Cmd>, argv?: string[]): ParsedCmd | string;
/**
 * Returns the first Cmd to match in given `argv` grouped with its index in `argv`.
 */
export declare function getFirstIndexedCmd(cmds: Cmd[], argv: string[]): IndexedItem<Cmd | undefined>;
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
export declare function getNamedArgvs(parsedCmd: ParsedCmd, separator?: string): NamedItem<string[]>[];
