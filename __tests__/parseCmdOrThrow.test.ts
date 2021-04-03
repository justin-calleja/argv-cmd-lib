import { testParseCmdOrThrow } from './utils';
import {
  adhocCmd,
  configCmd,
  configWatchCmd,
  configWatchStartCmd,
  serverCmd,
  serverStartCmd,
  serverStopCmd,
} from './adhocCmd';
import { Cmd, ParsedCmd } from '../src';

describe('parseCmdOrThrow', () => {
  describe('given adhocCmd', () => {
    const createTestTuple = (
      argv: string[],
      expectedResult: ParsedCmd,
    ): [string[], Partial<Cmd>, ParsedCmd] => [argv, adhocCmd, expectedResult];

    // TODO: add test for invalid input (no command name) - that it throws.

    testParseCmdOrThrow([
      createTestTuple([], {
        ...adhocCmd,
        argv: [],
      }),
      createTestTuple(['hello', '-v', 'server', '-s'], {
        ...adhocCmd,
        subCmds: [
          configCmd,
          {
            ...serverCmd,
            argv: ['-s'],
          },
        ],
        argv: ['hello', '-v'],
      }),
      createTestTuple(
        ['config', '-v', 'server', 'start', 'watch', '-s', 'start'],
        {
          ...adhocCmd,
          subCmds: [
            {
              ...configCmd,
              subCmds: [
                {
                  ...configWatchCmd,
                  subCmds: [
                    {
                      ...configWatchStartCmd,
                      argv: [],
                    },
                  ],
                  argv: ['-s'],
                },
              ],
              argv: ['-v', 'server', 'start'],
            },
            serverCmd,
          ],
          argv: [],
        },
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
        {
          ...adhocCmd,
          subCmds: [
            configCmd,
            {
              ...serverCmd,
              subCmds: [
                {
                  ...serverStartCmd,
                  argv: ['start', 'stop', '-s', 'start'],
                },
                serverStopCmd,
              ],
              argv: ['config'],
            },
          ],
          argv: ['start', '-v'],
        },
      ),
    ]);
  });
});
