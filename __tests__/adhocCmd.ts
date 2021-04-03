// NOTE: providing subCmds when it's an empty array is just for TS...

export const serverStartCmd = { name: 'start', subCmds: [] };
export const serverStopCmd = { name: 'stop', subCmds: [] };
export const serverCmd = {
  name: 'server',
  subCmds: [serverStartCmd, serverStopCmd],
};

export const configWatchStartCmd = { name: 'start', subCmds: [] };
export const configWatchCmd = {
  name: 'watch',
  subCmds: [configWatchStartCmd],
};
export const configCmd = {
  name: 'config',
  subCmds: [configWatchCmd],
};

export const adhocCmd = {
  name: 'adhoc',
  subCmds: [configCmd, serverCmd],
};
