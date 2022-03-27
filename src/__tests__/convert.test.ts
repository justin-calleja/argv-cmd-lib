import { groupArgvByCmds } from '../index';

const paths = [
  'config/ls.js',
  'config/set.js',
  'config/get.js',
  'info.js',
  'mr/create.js',
  'server/start.js',
  'server/stop.js',
  'server/config/ls.js',
];

describe('groupArgvByCmds', () => {
  describe('With default rootCmd', () => {
    it(`['-V', 'config', '--help', 'ls', '-a']`, () => {
      const argv = ['-V', 'config', '--help', 'ls', '-a'];
      const result = groupArgvByCmds(argv, paths);
      expect(result).toEqual([
        ['./index', ['-V']],
        ['./config', ['--help']],
        ['./config/ls', ['-a']],
      ]);
    });
    it(`['mr', '-url', 'http://somewhere.com', 'create', '123', '-V']`, () => {
      const argv = [
        'mr',
        '-url',
        'http://somewhere.com',
        'create',
        '123',
        '-V',
      ];
      const result = groupArgvByCmds(argv, paths);
      expect(result).toEqual([
        ['./index', []],
        ['./mr', ['-url', 'http://somewhere.com']],
        ['./mr/create', ['123', '-V']],
      ]);
    });
  });

  describe('With custom rootCmd', () => {
    it(`['config', '--help', 'ls', '-a']`, () => {
      const argv = ['config', '--help', '--now', 'ls', '-a'];
      const result = groupArgvByCmds(argv, paths, { rootCmd: 'sdf' });
      expect(result).toEqual([
        ['./sdf', []],
        ['./config', ['--help', '--now']],
        ['./config/ls', ['-a']],
      ]);
    });
  });

  describe('With custom basePath', () => {
    it(`['-V', 'server', '-p', '3000', 'start']`, () => {
      const argv = ['-V', 'server', '-p', '3000', 'start'];
      const result = groupArgvByCmds(argv, paths, { basePath: './cmds/sdf' });
      expect(result).toEqual([
        ['./cmds/sdf/index', ['-V']],
        ['./cmds/sdf/server', ['-p', '3000']],
        ['./cmds/sdf/server/start', []],
      ]);
    });
  });

  describe('With custom basePath and rootCmd', () => {
    it(`['-V', 'server', '-p', '3000', 'start']`, () => {
      const argv = ['-V', 'server', '-p', '3000', 'start'];
      const result = groupArgvByCmds(argv, paths, {
        basePath: './cmds/sdf',
        rootCmd: 'main',
      });
      expect(result).toEqual([
        ['./cmds/sdf/main', ['-V']],
        ['./cmds/sdf/server', ['-p', '3000']],
        ['./cmds/sdf/server/start', []],
      ]);
    });
  });

  describe('With custom basePath and empty rootCmd', () => {
    it(`['-V', 'server', '-p', '3000', 'start']`, () => {
      const argv = ['-V', 'server', '-p', '3000', 'start'];
      const result = groupArgvByCmds(argv, paths, {
        basePath: './cmds/sdf',
        rootCmd: '',
      });
      expect(result).toEqual([
        ['./cmds/sdf', ['-V']],
        ['./cmds/sdf/server', ['-p', '3000']],
        ['./cmds/sdf/server/start', []],
      ]);
    });
  });

  describe('Not matching till end', () => {
    it(`['-V', 'server', '-p', '3000']`, () => {
      const argv = ['-V', 'server', '-p', '3000'];
      const result = groupArgvByCmds(argv, paths);
      expect(result).toEqual([
        ['./index', ['-V']],
        ['./server', ['-p', '3000']],
      ]);
    });
  });

  describe('Empty argv', () => {
    it(`Works with default rootCmd`, () => {
      const argv: string[] = [];
      const result = groupArgvByCmds(argv, paths);
      expect(result).toEqual([['./index', []]]);
    });
    it(`Works with custom rootCmd`, () => {
      const argv: string[] = [];
      const result = groupArgvByCmds(argv, paths, { rootCmd: 'sdf' });
      expect(result).toEqual([['./sdf', []]]);
    });
    it(`Works with custom basePath`, () => {
      const argv: string[] = [];
      const result = groupArgvByCmds(argv, paths, { basePath: './cmds/sdf' });
      expect(result).toEqual([['./cmds/sdf/index', []]]);
    });
    it(`Works with custom basePath and rootCmd`, () => {
      const argv: string[] = [];
      const result = groupArgvByCmds(argv, paths, {
        basePath: './cmds/sdf',
        rootCmd: 'main',
      });
      expect(result).toEqual([['./cmds/sdf/main', []]]);
    });
  });

  describe('When paths is []', () => {
    const argv = ['config', '--help', '--now', 'ls', '-a'];
    it(`Gives expected result with rootCmd set`, () => {
      expect(groupArgvByCmds(argv, [], { rootCmd: 'sdf' })).toEqual([
        ['./sdf', []],
      ]);
    });
    it(`Gives expected result with defaults`, () => {
      expect(groupArgvByCmds(argv, [])).toEqual([['./index', []]]);
    });
    it(`Gives expected result with basePath set`, () => {
      expect(groupArgvByCmds(argv, [], { basePath: './cmds/sdf' })).toEqual([
        ['./cmds/sdf/index', []],
      ]);
    });
    it(`Gives expected result with basePath and rootCmd set`, () => {
      expect(
        groupArgvByCmds(argv, [], {
          basePath: './cmds/sdf',
          rootCmd: 'main',
        }),
      ).toEqual([['./cmds/sdf/main', []]]);
    });
    it(`Gives expected result with basePath set and rootCmd set to ''`, () => {
      expect(
        groupArgvByCmds(argv, [], { basePath: './cmds/sdf', rootCmd: '' }),
      ).toEqual([['./cmds/sdf', []]]);
    });
    it(`Gives expected result with rootCmd set to ''`, () => {
      expect(groupArgvByCmds(argv, [], { rootCmd: '' })).toEqual([['.', []]]);
    });
  });
});
