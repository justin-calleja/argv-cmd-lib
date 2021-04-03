import { IndexedItem } from '../lib';
import {
  parseCmdOrThrow,
  Cmd,
  NamedItem,
  ParsedCmd,
  getFirstIndexedCmd,
  getNamedArgvs,
  getParsedCmdNames,
} from '../src/index';

export type TestTuple<
  ExpectedResultType,
  FirstArgType = Partial<Cmd>,
  SecondArgType = string[]
> = [
  // Needs to be first el in tuple if you want to pick up argv as the first format parameter (%p)
  argv: SecondArgType,
  cmd: FirstArgType,
  expectedResult: ExpectedResultType,
];

export const testGetFirstIndexedCmd = (
  testTuples: TestTuple<IndexedItem<Cmd | undefined>, Cmd[]>[],
) => {
  test.each(testTuples)(`and argv: %p`, (argv, cmds, expectedResult) => {
    expect(getFirstIndexedCmd(cmds, argv)).toEqual(expectedResult);
  });
};

export const testGetNamedArgvs = (
  testTuples: TestTuple<NamedItem<string[]>[]>[],
) => {
  test.each(testTuples)(`and argv: %p`, (argv, cmd, expectedResult) => {
    expect(getNamedArgvs(parseCmdOrThrow(cmd, argv))).toEqual(expectedResult);
  });
};

export const testGetParsedCmdNames = (testTuples: TestTuple<string[]>[]) => {
  test.each(testTuples)(`and argv: %p`, (argv, cmd, expectedResult) => {
    expect(getParsedCmdNames(parseCmdOrThrow(cmd, argv))).toEqual(
      expectedResult,
    );
  });
};

export const testParseCmdOrThrow = (testTuples: TestTuple<ParsedCmd>[]) => {
  test.each(testTuples)(`and argv: %p`, (argv, cmd, expectedResult) => {
    expect(parseCmdOrThrow(cmd, argv)).toEqual(expectedResult);
  });
};
