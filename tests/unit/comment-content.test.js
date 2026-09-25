import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
    escapeHtml,
    findUrlToken,
    mentionHtml,
    linkCardHtml,
    imageAnchorHtml,
    composeCommentContent,
} from '@/utils/comment-content.js';

// 与 CommentsSheet.extractAttachment 同一套匹配：提交格式必须能被本项目自己解析回来
const EXTRACT = /<a[^>]*>(?:\[[^\]]*\]|查看[^<]*)<\/a>/;
const HREF = /href="([^"]+)"/;

test('escapeHtml 把标签与引号全部转义', () => {
    assert.equal(
        escapeHtml(`<img src=x onerror="alert('1')">`),
        '&lt;img src=x onerror=&quot;alert(&#39;1&#39;)&quot;&gt;'
    );
    assert.equal(escapeHtml('a&b'), 'a&amp;b');
    assert.equal(escapeHtml(null), '');
});

test('findUrlToken 只在 URL 正好结束于光标前一位时命中', () => {
    assert.deepEqual(findUrlToken('看看 https://a.com/x '), {
        url: 'https://a.com/x', start: 3, end: 18,
    });
    assert.equal(findUrlToken('还没敲空格 https://a.com/x'), null, '缺尾部空格不应命中');
    assert.equal(findUrlToken('没有链接'), null);
});

test('@用户锚点带 member_mention 与尾部空格', () => {
    const html = mentionHtml({ id: 'u1', name: '张三' });
    assert.match(html, /class="member_mention"/);
    assert.match(html, /href="\/people\/u1"/);
    assert.ok(html.endsWith('</a>'), '锚点自身完整');
    assert.ok(html.includes('@张三 </a>'), '@昵称 后必须带空格');
});

test('锚点属性里的引号不会截断标签', () => {
    const html = mentionHtml({ id: 'u1"onmouseover="alert(1)', name: 'a"b' });
    assert.ok(!/onmouseover="alert/.test(html), '未转义的属性注入应被挡掉');
    assert.equal((html.match(/"/g) || []).length, 6, '只剩锚点自己的 6 个引号');
});

test('链接卡片锚点带标题与图标', () => {
    const html = linkCardHtml({ url: 'https://a.com/?x=1&y=2', title: '标题', iconName: 'web' });
    assert.match(html, /data-draft-type="text-link"/);
    assert.match(html, /data-icon-name="web"/);
    assert.match(html, /href="https:\/\/a\.com\/\?x=1&amp;y=2"/, '& 需转义');
    assert.ok(html.endsWith('>标题</a>'));
});

test('图片锚点能被本项目自己的解析器读回来（自己产的格式自己必须认）', () => {
    for (const isGif of [false, true]) {
        const html = imageAnchorHtml({ url: 'https://pic1.zhimg.com/v2-abc.jpg', isGif, width: 800, height: 600 });
        const match = html.match(EXTRACT);
        assert.ok(match, 'extractAttachment 的正则应命中');
        assert.equal(match[0].match(HREF)[1], 'https://pic1.zhimg.com/v2-abc.jpg');
        assert.match(html, isGif ? /class="comment_gif"/ : /class="comment_img"/);
        assert.match(html, /data-width="800" data-height="600"/);
    }
});

test('图片宽高缺省上送 0', () => {
    const html = imageAnchorHtml({ url: 'https://x/y.png' });
    assert.match(html, /data-width="0" data-height="0"/);
});

test('提交前整体转义：正文里的标签不会漏进 DOM', () => {
    const out = composeCommentContent('<img src=x onerror=alert(1)> 普通文字');
    assert.ok(!out.includes('<img'), '原始标签不应存在');
    assert.ok(out.includes('&lt;img src=x onerror=alert(1)&gt;'));
});

test('正文与锚点混排：@ 与链接卡片各自替换一次', () => {
    const text = '@张三 看这个 标题 还有 @张三 重复';
    const out = composeCommentContent(
        text,
        [{ id: 'u1', name: '张三' }],
        [{ url: 'https://a.com', title: '标题' }]
    );
    assert.equal((out.match(/member_mention/g) || []).length, 1, '同名 @ 只替换首次出现');
    assert.equal((out.match(/data-draft-type="text-link"/g) || []).length, 1);
    assert.ok(out.includes('还有 @张三 重复'), '未命中的重复项保持原样');
});

test('纯文本评论原样转义输出', () => {
    assert.equal(composeCommentContent('好'), '好');
    assert.equal(composeCommentContent(''), '');
});
