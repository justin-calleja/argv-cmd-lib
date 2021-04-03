import { testGetFirstIndexedCmd } from './utils';
import { serverCmd, configCmd } from './adhocCmd';

describe('parseCmdOrThrow', () => {
  describe('given adhocCmd', () => {
    testGetFirstIndexedCmd([
      [[], [serverCmd, configCmd], [-1, undefined]],
      [['hello', '-v', 'server', '-s'], [serverCmd], [2, serverCmd]],
      [
        ['hello', '-v', 'config', 'server', '-s'],
        [serverCmd, configCmd],
        [2, configCmd],
      ],
      [
        ['hello', '-v', 'server', 'config', '-s'],
        [serverCmd, configCmd],
        [2, serverCmd],
      ],
      [
        ['hello', '-v', 'world', '-s'],
        [serverCmd, configCmd],
        [-1, undefined],
      ],
    ]);
  });
});
