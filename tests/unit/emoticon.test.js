import { test } from 'node:test';
import assert from 'node:assert/strict';

test('emoticon：占位符替换与切分，未识别的原样保留', async () => {
    const mod = await import('@/services/emoticon.js');
    mod.emoticonMap.value = { '[感谢]': 'https://img/a.png', '[666]': 'https://img/b.png' };

    assert.equal(
        mod.injectEmoticons('谢谢[感谢]老师'),
        '谢谢<img class="emoticon-img" src="https://img/a.png" alt="[感谢]" />老师',
    );
    assert.equal(mod.injectEmoticons('[未收录]还在'), '[未收录]还在', '库里没有的占位符不该被吞掉');
    assert.equal(mod.injectEmoticons(42), 42, '非字符串原样返回');

    const parts = mod.tokenizeEmoticons('前排[666][感谢]');
    assert.deepEqual(parts, [
        { type: 'text', value: '前排' },
        { type: 'emoticon', url: 'https://img/b.png', name: '[666]' },
        { type: 'emoticon', url: 'https://img/a.png', name: '[感谢]' },
    ], '文本与表情要切成可 v-for 渲染的片段');

    assert.deepEqual(mod.tokenizeEmoticons('纯文字'), [{ type: 'text', value: '纯文字' }]);
    assert.deepEqual(mod.tokenizeEmoticons(''), [], '空输入不产生片段');
    assert.deepEqual(mod.tokenizeEmoticons('[未收录]'), [{ type: 'text', value: '[未收录]' }],
        '未识别的占位符按文本保留（预览行靠"有没有表情片段"决定显不显示）');

    const mention = () => [{ text: '@甲 ', kind: 'mention', count: 1, used: 0 }];
    assert.deepEqual(mod.tokenizeEmoticons('前排@甲 谢谢', undefined, mention()), [
        { type: 'text', value: '前排' },
        { type: 'token', value: '@甲 ', kind: 'mention' },
        { type: 'text', value: '谢谢' },
    ], '账本里的 @昵称 要单独成段（输入区据此画成整块蓝色、整体删除）');

    assert.deepEqual(mod.tokenizeEmoticons('@甲 @甲', undefined, mention()), [
        { type: 'token', value: '@甲 ', kind: 'mention' },
        { type: 'text', value: '@甲' },
    ], '一条账只吃一次出现，多出来的按文本留着');

    assert.deepEqual(mod.tokenizeEmoticons('谢谢[感谢]老师', undefined, [{ text: '谢谢[感谢]', kind: 'link', count: 1, used: 0 }]), [
        { type: 'token', value: '谢谢[感谢]', kind: 'link' },
        { type: 'text', value: '老师' },
    ], '标题里含表情占位符时按整块标记处理，不再切表情');
});

test('emoticon：只取第一组，后面的组整体跳过', async () => {
    const mod = await import('@/services/emoticon.js');
    globalThis.window.zh_emoticon = [
        { title: '默认', stickers: [{ placeholder: '[感谢]', static_image_url: 'https://img/default.png' }] },
        {
            title: '包子',
            stickers: [
                { placeholder: '[感谢]', static_image_url: 'https://img/baozi.png' },
                { placeholder: '[666]', static_image_url: 'https://img/baozi666.png' },
            ],
        },
    ];
    await mod.loadEmoticons();

    assert.equal(mod.emoticonMap.value['[感谢]'], 'https://img/default.png',
        '两组同名占位符图不同，取第一组才能与面板一致');
    assert.equal(mod.emoticonMap.value['[666]'], undefined, '第二组不参与映射');
    assert.deepEqual(mod.emoticonStickers.value.map((s) => s.placeholder), ['[感谢]'],
        '面板清单就是第一组的 stickers');
});
