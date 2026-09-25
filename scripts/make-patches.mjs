// 重新生成 Framework7 补丁：先清掉旧补丁，再按排除规则各生成一份。
// 补丁文件名里的版本号取自 node_modules 里实际安装的版本，所以升级框架后跑一次本脚本即可。
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const patchesDir = path.join(root, 'patches');

const PACKAGES = [
    ['framework7', '(\\.map$|\\.less$|\\.css$|\\.d\\.ts$|\\.min\\.|framework7-bundle\\.js$|LICENSE)'],
    ['framework7-vue', '(\\.d\\.ts$|\\.map$|\\.css$|\\.less$|LICENSE|framework7-vue-bundle)'],
];

if (existsSync(patchesDir)) {
    for (const name of readdirSync(patchesDir)) {
        if (name.startsWith('framework7')) rmSync(path.join(patchesDir, name));
    }
}

for (const [pkg, exclude] of PACKAGES) {
    console.log(`\n== patch-package ${pkg} ==`);
    execFileSync(process.execPath, [
        path.join(root, 'node_modules', 'patch-package', 'index.js'),
        pkg,
        '--exclude',
        exclude,
    ], { cwd: root, stdio: 'inherit' });
}

console.log('\n补丁已生成，检查 diff 后与 node_modules 里的改动一起提交。');
