// 跑真接口用例：置 LIVE=1 让 setup.mjs 把 GM 桥换成 dev 反代，只跑 tests/live。
// 用 node 起子进程是为了跨平台（npm script 里直接写 LIVE=1 … 在 Windows cmd 下不成立）。
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const child = spawn(process.execPath,
    ['--import', './tests/helpers/setup.mjs', '--test', 'tests/live/api.test.js'],
    { cwd: root, stdio: 'inherit', env: { ...process.env, LIVE: '1' } });

child.on('exit', (code) => process.exit(code ?? 1));
