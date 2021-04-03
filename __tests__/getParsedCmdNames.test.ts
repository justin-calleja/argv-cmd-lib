import { testGetParsedCmdNames } from './utils';
import { adhocCmd } from './adhocCmd';
import { Cmd } from '../src';

describe('parseCmdOrThrow', () => {
  describe('given adhocCmd', () => {
    const createTestTuple = (
      argv: string[],
      expectedResult: string[],
    ): [argv: string[], rootCmd: Partial<Cmd>, parsedCmdNames: string[]] => [
      argv,
      adhocCmd,
      expectedResult,
    ];

    testGetParsedCmdNames([
      createTestTuple([], ['adhoc']),
      createTestTuple(['hello', '-v', 'server', '-s'], ['adhoc', 'server']),
      createTestTuple(
        ['config', '-v', 'server', 'start', 'watch', '-s', 'start'],
        ['adhoc', 'config', 'watch', 'start'],
      ),
      createTestTuple(
        [
          'start',
          '-v',
          'server',
          'config',
          'start',
          'start',
          'stop',
          '-s',
          'start',
        ],
        ['adhoc', 'server', 'start'],
      ),
    ]);
  });
});
