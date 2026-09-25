// f7 图标名写错不会报错，只会渲染成空白，所以按 framework7-icons 的真实文件名校验。
// （material 图标走字体连字，包内没有类名清单，无法这样校验。）
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ICON } from '@/core/icons.js';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../src');
const ICON_DIR = path.resolve(SRC, '../node_modules/framework7-icons/svg');

function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(dir, e.name);
        return e.isDirectory() ? walk(p) : [p];
    });
}

test('源码里用到的每个 f7 图标名都存在于图标集', () => {
    const known = new Set(fs.readdirSync(ICON_DIR).filter((f) => f.endsWith('.svg')).map((f) => f.slice(0, -4)));
    const used = new Set();

    for (const file of walk(SRC)) {
        if (!/\.(vue|js)$/.test(file)) continue;
        const text = fs.readFileSync(file, 'utf-8');
        for (const m of text.matchAll(/f7:([a-z0-9_]+)/g)) used.add(m[1]);
        // EmptyState 的 icon 传的是裸名字，模板里按 f7 渲染
        for (const m of text.matchAll(/<EmptyState[^>]*\bicon="([a-z0-9_]+)"/g)) used.add(m[1]);
    }
    for (const value of Object.values(ICON)) {
        const name = typeof value === 'string' ? value : value?.ios;
        if (typeof name === 'string' && name.startsWith('f7:')) used.add(name.slice(3));
    }

    assert.ok(used.size > 20, `只抓到 ${used.size} 个图标名，扫描方式可能失效`);
    assert.deepEqual([...used].filter((n) => !known.has(n)).sort(), [], '存在图标集里没有的 f7 图标名');
});
