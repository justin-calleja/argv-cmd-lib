import { testGetNamedArgvs } from './utils';
import { adhocCmd } from './adhocCmd';
import { Cmd, NamedItem } from '../src';

describe('parseCmdOrThrow', () => {
  describe('given adhocCmd', () => {
    type TestTuple = [
      argv: string[],
      rootCmd: Partial<Cmd>,
      namedArgvs: NamedItem<string[]>[],
    ];

    const createTestTuple = (
      argv: string[],
      expectedResult: NamedItem<string[]>[],
    ): TestTuple => [argv, adhocCmd, expectedResult];

    testGetNamedArgvs([
      createTestTuple([], [['adhoc', []]]),
      createTestTuple(
        ['hello', '-v', 'server', '-s'],
        [
          ['adhoc', ['hello', '-v']],
          ['adhoc.server', ['-s']],
        ],
      ),
      createTestTuple(
        ['config', '-v', 'server', 'start', 'watch', '-s', 'start'],
        [
          ['adhoc', []],
          ['adhoc.config', ['-v', 'server', 'start']],
          ['adhoc.config.watch', ['-s']],
          ['adhoc.config.watch.start', []],
        ],
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
        [
          ['adhoc', ['start', '-v']],
          ['adhoc.server', ['config']],
          ['adhoc.server.start', ['start', 'stop', '-s', 'start']],
        ],
      ),
    ]);
  });
});
