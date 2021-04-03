"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNamedArgvs = exports.getParsedCmdNames = exports.getFirstIndexedCmd = exports.parseCmd = exports.parseCmdOrThrow = exports.isParsedCmd = void 0;
/**
 * Used to determine if a Cmd is a ParsedCmd.
 */
function isParsedCmd(cmd) {
    return (typeof cmd.name === 'string' && 'argv' in cmd && Array.isArray(cmd.argv));
}
exports.isParsedCmd = isParsedCmd;
/**
 * You should pass in your root command and `process.argv.slice(2)`.
 *
 * The returned ParsedCmd can be used with other functions to determine which command your app should run.
 *
 * Throws if the given command or any of its sub commands is missing a name.
 */
function parseCmdOrThrow(
// NOTE: unfortunately, Partial<Cmd> does not make cmd.subCmds also of type Partial<Cmd> i.e.
// cmd.subCmds can be undefined but if it's not, then it's a Cmd[] not a Partial<Cmd>[]...
_a, argv) {
    var name = _a.name, subCmds = _a.subCmds;
    if (argv === void 0) { argv = []; }
    if (name === undefined) {
        throw new Error("A command's name is required.");
    }
    return _parseCmdOrThrow({ name: name, subCmds: subCmds !== null && subCmds !== void 0 ? subCmds : [] }, argv);
}
exports.parseCmdOrThrow = parseCmdOrThrow;
function _parseCmdOrThrow(cmd, argv) {
    var _a = getFirstIndexedCmd(cmd.subCmds, argv), indexOfFirstSubCmdInArgv = _a[0], firstSubCmdInArgv = _a[1];
    if (firstSubCmdInArgv === undefined) {
        return __assign(__assign({}, cmd), { argv: argv });
    }
    // This cmd's parsing should only consider till the subCmd:
    var cmdArgv = argv.slice(0, indexOfFirstSubCmdInArgv);
    var subCmdArgv = argv.slice(indexOfFirstSubCmdInArgv + 1);
    // use parseCmdOrThrow (not _parseCmdOrThrow) to ensure firstSubCmdInArgv is a valid Cmd:
    var parsedSubCmd = parseCmdOrThrow(firstSubCmdInArgv, subCmdArgv);
    // NOTE: not using tail recursion (but engine would have to support it anyway).
    // Stack will keep growing but not expecting a lot of recursion.
    // Too many sub-commands will make your cli app unusable anyway.
    return __assign(__assign({}, cmd), { subCmds: cmd.subCmds.map(function (subCmd) {
            return subCmd.name === parsedSubCmd.name ? parsedSubCmd : subCmd;
        }), argv: cmdArgv });
}
/**
 * Same as parseCmdOrThrow but returns a string describing the error instead of throwing.
 */
function parseCmd(partialCmd, argv) {
    if (argv === void 0) { argv = []; }
    try {
        return parseCmdOrThrow(partialCmd, argv);
    }
    catch (err) {
        return err.message;
    }
}
exports.parseCmd = parseCmd;
/**
 * Returns the first Cmd to match in given `argv` grouped with its index in `argv`.
 */
function getFirstIndexedCmd(cmds, argv) {
    return cmds
        .map(function (cmd) { return [argv.indexOf(cmd.name), cmd]; })
        .filter(function (_a) {
        var indexOfSubCmdNameInArgv = _a[0];
        return indexOfSubCmdNameInArgv !== -1;
    })
        .reduce(function (acc, curr) {
        if (acc[0] === -1) {
            return curr;
        }
        if (curr[0] < acc[0]) {
            acc = curr;
        }
        return acc;
    }, [-1, undefined]);
}
exports.getFirstIndexedCmd = getFirstIndexedCmd;
/**
 * Returns a list of parsed command names.
 *
 * You can get the fully qualified name of the last matched command (the one to run)
 * by joining these names with '.' (the default separator; or any other separator you're using).
 */
function getParsedCmdNames(cmd) {
    return _getParsedCmdNames(cmd, []);
}
exports.getParsedCmdNames = getParsedCmdNames;
function _getParsedCmdNames(parsedCmd, acc) {
    var parsedSubCmd = parsedCmd.subCmds.find(isParsedCmd);
    return parsedSubCmd === undefined
        ? __spreadArray(__spreadArray([], acc), [parsedCmd.name]) : _getParsedCmdNames(parsedSubCmd, __spreadArray(__spreadArray([], acc), [parsedCmd.name]));
}
/**
 * Returns a list of all `argv`s which where parsed out of the original `process.argv`, grouped with
 * the fully qualified name of the command that matched.
 *
 * Each command's `argv` can now be further processed to parse its options with an option parsing library
 * like minimist.
 */
function getNamedArgvs(parsedCmd, separator) {
    if (separator === void 0) { separator = '.'; }
    return _getNamedArgvs(parsedCmd, separator, []);
}
exports.getNamedArgvs = getNamedArgvs;
function _getNamedArgvs(parsedCmd, separator, acc) {
    var parsedSubCmd = parsedCmd.subCmds.find(isParsedCmd);
    var fullyQualifiedCmdName = acc.length === 0
        ? parsedCmd.name
        : "" + acc.slice(-1)[0][0] + separator + parsedCmd.name;
    var namedArgv = [
        fullyQualifiedCmdName,
        parsedCmd.argv,
    ];
    return parsedSubCmd === undefined
        ? __spreadArray(__spreadArray([], acc), [namedArgv]) : _getNamedArgvs(parsedSubCmd, separator, __spreadArray(__spreadArray([], acc), [namedArgv]));
}
