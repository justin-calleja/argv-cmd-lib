import createRegexpStrFromSubCmds from '../createRegexpStrFromSubCmds.js';

test.each([
  [['get'], '--target next', null],
  [['mr', 'get'], '--target next', null],
  [
    ['mr', 'get'],
    'mr --target next',
    { cmdArgvAsStr: '', nextCmd: 'mr', remainingArgvAsStr: ' --target next' },
  ],
])('regex test %#.', (subCmds, argvStr, expectedResult) => {
  const regexpStr = createRegexpStrFromSubCmds(subCmds);
  const regexp = new RegExp(regexpStr);
  const result = regexp.exec(argvStr);
  if (expectedResult === null) {
    expect(result).toBe(null);
  } else {
    expect(result?.[1]).toBe(expectedResult.cmdArgvAsStr);
    expect(result?.[2]).toBe(expectedResult.nextCmd);
    expect(result?.[3]).toBe(expectedResult.remainingArgvAsStr);
  }
});
