import { CmdArgv, groupArgvByCmds, Opts } from '../index';

const paths = [
  'config/ls.js',
  'config/set.js',
  'config/get.js',
  'config/index.js',
  'index.js',
  'info.js',
  'mr/create.js',
  'server/start.js',
  'server/stop.js',
  'server/config/ls.js',
];

// ^[ 	]*(.*?)[ 	]*(ls|set|get|create|start|stop|config)[ 	]*(.*?)[ 	]*$
//
// --target next

const createTest = (
  expectedResult: CmdArgv[],
  argv: string[],
  paths: string[],
  opts?: Opts,
): [CmdArgv[], string[], string[], Opts | undefined] => [
  expectedResult,
  argv,
  paths,
  opts,
];

test.each([
  // createTest([['./index.js', []]], [], paths, undefined),
  // createTest(
  //   [['./index.js', ['-V', '--help', 'hello']]],
  //   ['-V', '--help', 'hello'],
  //   paths,
  //   undefined,
  // ),
  createTest(
    [
      ['./index.js', []],
      ['./config/index.js', ['-d']],
    ],
    // >> groupedArgv: [ [ './index.js', [ 'config', '-d' ] ] ]
    ['config', '-d'],
    // [ 'config/index.js', 'index.js' ]
    paths,
    undefined,
  ),
  createTest(
    [
      ['./index.js', []],
      ['./mr/index.js', ['--target', 'next']],
    ],
    ['mr', '--target', 'next'],
    paths,
    undefined,
  ),
  createTest(
    [
      ['./index.js', []],
      ['./mr/index.js', []],
      ['./mr/create.js', ['--target', 'next']],
    ],
    ['mr', 'create', '--target', 'next'],
    paths,
    undefined,
  ),
  createTest(
    [
      ['./index.js', ['-V']],
      ['./config/index.js', ['--help']],
      ['./config/ls.js', ['-a']],
    ],
    ['-V', 'config', '--help', 'ls', '-a'],
    paths,
    undefined,
  ),
])('%# groupArgvByCmds', (expectedResult, argv, paths, opts) => {
  const result = groupArgvByCmds(argv, paths, opts);
  expect(result).toEqual(expectedResult);
});

// describe(`['-V', 'config', '--help', 'ls', '-a']`, () => {
//   const argv = ['-V', 'config', '--help', 'ls', '-a'];
//   it('works with default opts', () => {
//     const result = groupArgvByCmds(argv, paths);
//     expect(result).toEqual([
//       ['./index.js', ['-V']],
//       ['./config/index.js', ['--help']],
//       ['./config/ls.js', ['-a']],
//     ]);
//   });
//   it('works with basePath of ./cmds', () => {
//     const result = groupArgvByCmds(argv, paths, { basePath: './cmds' });
//     expect(result).toEqual([
//       ['./cmds/index.js', ['-V']],
//       ['./cmds/config/index.js', ['--help']],
//       ['./cmds/config/ls.js', ['-a']],
//     ]);
//   });
// });

// describe('groupArgvByCmds', () => {
//   describe('With default rootCmd', () => {
//     it.only(`['-V', 'config', '--help', 'ls', '-a']`, () => {});
//     it(`['mr', '-url', 'http://somewhere.com', 'create', '123', '-V']`, () => {
//       const argv = [
//         'mr',
//         '-url',
//         'http://somewhere.com',
//         'create',
//         '123',
//         '-V',
//       ];
//       const result = groupArgvByCmds(argv, paths);
//       expect(result).toEqual([
//         ['./index.js', []],
//         ['./mr/index.js', ['-url', 'http://somewhere.com']],
//         ['./mr/create/index.js', ['123', '-V']],
//       ]);
//     });
//   });

//   // TODO: add tests which has many argv but only matches root cmd

//   // describe('With custom rootCmd', () => {
//   //   it(`['config', '--help', 'ls', '-a']`, () => {
//   //     const argv = ['config', '--help', '--now', 'ls', '-a'];
//   //     const result = groupArgvByCmds(argv, paths, { indexFile: 'sdf' });
//   //     expect(result).toEqual([
//   //       ['./sdf', []],
//   //       ['./config', ['--help', '--now']],
//   //       ['./config/ls', ['-a']],
//   //     ]);
//   //   });
//   // });

//   // describe('With custom basePath', () => {
//   //   it(`['-V', 'server', '-p', '3000', 'start']`, () => {
//   //     const argv = ['-V', 'server', '-p', '3000', 'start'];
//   //     const result = groupArgvByCmds(argv, paths, { basePath: './cmds/sdf' });
//   //     expect(result).toEqual([
//   //       ['./cmds/sdf/index', ['-V']],
//   //       ['./cmds/sdf/server', ['-p', '3000']],
//   //       ['./cmds/sdf/server/start', []],
//   //     ]);
//   //   });
//   // });

//   // describe('With custom basePath and rootCmd', () => {
//   //   it(`['-V', 'server', '-p', '3000', 'start']`, () => {
//   //     const argv = ['-V', 'server', '-p', '3000', 'start'];
//   //     const result = groupArgvByCmds(argv, paths, {
//   //       basePath: './cmds/sdf',
//   //       indexFile: 'main',
//   //     });
//   //     expect(result).toEqual([
//   //       ['./cmds/sdf/main', ['-V']],
//   //       ['./cmds/sdf/server', ['-p', '3000']],
//   //       ['./cmds/sdf/server/start', []],
//   //     ]);
//   //   });
//   // });

//   // describe('With custom basePath and empty rootCmd', () => {
//   //   it(`['-V', 'server', '-p', '3000', 'start']`, () => {
//   //     const argv = ['-V', 'server', '-p', '3000', 'start'];
//   //     const result = groupArgvByCmds(argv, paths, {
//   //       basePath: './cmds/sdf',
//   //       indexFile: '',
//   //     });
//   //     expect(result).toEqual([
//   //       ['./cmds/sdf', ['-V']],
//   //       ['./cmds/sdf/server', ['-p', '3000']],
//   //       ['./cmds/sdf/server/start', []],
//   //     ]);
//   //   });
//   // });

//   // describe('Not matching till end', () => {
//   //   it(`['-V', 'server', '-p', '3000']`, () => {
//   //     const argv = ['-V', 'server', '-p', '3000'];
//   //     const result = groupArgvByCmds(argv, paths);
//   //     expect(result).toEqual([
//   //       ['./index', ['-V']],
//   //       ['./server', ['-p', '3000']],
//   //     ]);
//   //   });
//   // });

//   // describe('Empty argv', () => {
//   //   it(`Works with default rootCmd`, () => {
//   //     const argv: string[] = [];
//   //     const result = groupArgvByCmds(argv, paths);
//   //     expect(result).toEqual([['./index', []]]);
//   //   });
//   //   it(`Works with custom indexFile`, () => {
//   //     const argv: string[] = [];
//   //     const result = groupArgvByCmds(argv, paths, { indexFile: 'cmd.js' });
//   //     expect(result).toEqual([['./cmd.js', []]]);
//   //   });
//   //   it(`Works with custom basePath`, () => {
//   //     const argv: string[] = [];
//   //     const result = groupArgvByCmds(argv, paths, { basePath: './cmds/sdf' });
//   //     expect(result).toEqual([['./cmds/sdf/index', []]]);
//   //   });
//   //   it(`Works with custom basePath and indexFile`, () => {
//   //     const argv: string[] = [];
//   //     const result = groupArgvByCmds(argv, paths, {
//   //       basePath: './cmds/sdf',
//   //       indexFile: 'main',
//   //     });
//   //     expect(result).toEqual([['./cmds/sdf/main', []]]);
//   //   });
//   // });

//   // describe('When paths is []', () => {
//   //   const argv = ['config', '--help', '--now', 'ls', '-a'];
//   //   it(`Gives expected result with rootCmd set`, () => {
//   //     expect(groupArgvByCmds(argv, [], { indexFile: 'cmd.js' })).toEqual([
//   //       ['./cmd.js', []],
//   //     ]);
//   //   });
//   //   it(`Gives expected result with defaults`, () => {
//   //     expect(groupArgvByCmds(argv, [])).toEqual([['./index', []]]);
//   //   });
//   //   it(`Gives expected result with basePath set`, () => {
//   //     expect(groupArgvByCmds(argv, [], { basePath: './cmds/sdf' })).toEqual([
//   //       ['./cmds/sdf/index', []],
//   //     ]);
//   //   });
//   //   it(`Gives expected result with basePath and rootCmd set`, () => {
//   //     expect(
//   //       groupArgvByCmds(argv, [], {
//   //         basePath: './cmds/sdf',
//   //         indexFile: 'main.js',
//   //       }),
//   //     ).toEqual([['./cmds/sdf/main.js', []]]);
//   //   });
//   //   it(`Gives expected result with basePath set and indexFile set to ''`, () => {
//   //     expect(
//   //       groupArgvByCmds(argv, [], { basePath: './cmds/sdf', indexFile: '' }),
//   //     ).toEqual([['./cmds/sdf', []]]);
//   //   });
//   //   it(`Gives expected result with indexFile set to ''`, () => {
//   //     expect(groupArgvByCmds(argv, [], { indexFile: '' })).toEqual([['.', []]]);
//   //   });
//   // });
// });
