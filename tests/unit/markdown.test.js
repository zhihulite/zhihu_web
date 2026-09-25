import { test } from 'node:test';
import assert from 'node:assert/strict';

import { segmentsToMarkdown } from '@/utils/markdown.js';

const md = (segments) => segmentsToMarkdown(segments);

test('标题按 level 出等号，段落与行内标记各自成形', () => {
    const out = md([
        { type: 'heading', heading: { text: '标题', level: 2 } },
        {
            type: 'paragraph',
            paragraph: { text: '普通加粗', marks: [{ type: 'bold', start_index: 2, end_index: 4 }] },
        },
    ]);
    assert.equal(out.split('\n')[0], '## 标题');
    assert.ok(out.includes('普通**加粗**'));
});

test('引用逐行加前缀，代码块用围栏，分隔线用 ---', () => {
    const out = md([
        { type: 'blockquote', blockquote: { text: '第一行\n第二行', marks: [] } },
        { type: 'code_block', code_block: { content: 'let a=1' } },
        { type: 'hr' },
    ]);
    assert.ok(out.includes('> 第一行\n> 第二行'), out);
    assert.ok(out.includes('```\nlet a=1\n```'));
    assert.ok(out.trimEnd().endsWith('---'));
});

test('有序与无序列表分别按序号与短横', () => {
    const out = md([
        { type: 'list_node', list_node: { ordered: false, items: [{ text: '甲', marks: [] }] } },
        { type: 'list_node', list_node: { ordered: true, items: [{ text: '一', marks: [] }] } },
    ]);
    assert.ok(/^- 甲$/m.test(out), out);
    assert.ok(/^1\. 一$/m.test(out), out);
});

test('图片与链接卡片出 Markdown 链接，视频出可点占位', () => {
    const out = md([
        { type: 'image', image: { urls: ['https://x/y.png'] } },
        { type: 'card', card: { title: '卡片', extra_info: JSON.stringify({ url: 'https://z/q' }) } },
        { type: 'video', video: { id: 'v1', title: '视频' } },
    ]);
    assert.ok(out.includes('![](https://x/y.png)'));
    assert.ok(out.includes('[卡片](https://z/q)'));
    assert.match(out, /\[[^\]]*\]\(https:\/\/(www\.)?zhihu\.com/);
});

test('提示条不属正文：myapptip 一律不进结果', () => {
    const out = md([
        { type: 'myapptip', myapptip: { text: '作者关系提示' } },
        { type: 'paragraph', paragraph: { text: '正文', marks: [] } },
        { type: 'myapptip', myapptip: { text: '编辑于 2026-01-01' } },
    ]);
    assert.equal(out.includes('作者关系提示'), false);
    assert.equal(out.includes('编辑于'), false);
    assert.ok(out.includes('正文'));
});

test('data URI 图片丢弃，未知段类型不报错', () => {
    const out = md([
        { type: 'image', image: { urls: ['data:image/svg+xml;base64,AAAA'] } },
        { type: 'unknown_kind', unknown_kind: {} },
    ]);
    assert.equal(out.includes('data:image'), false);
});

test('空输入返回空串', () => {
    assert.equal(md([]), '');
    assert.equal(md(undefined), '');
});
