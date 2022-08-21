export const createRegexpStrFromSubCmds = (subCmds: string[]) =>
  // `^[ \t]*(.*?)[ \t]*(${subCmds.join('|')})[ \t]*(.*?)[ \t]*$`;
  // `^[ \t]*(.*?)[ \t]*(\b${subCmds.join('|')}\b)[ \t]*(.*?)[ \t]*$`;
  // `^[ \\t]*(.*?)\\b(${subCmds.join('|')})\\b[ \\t]*(.*?)[ \\t]*$`;
  `(.*)\\b(${subCmds.join('|')})\\b(.*)`;

export default createRegexpStrFromSubCmds;
