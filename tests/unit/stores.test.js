import { test } from 'node:test';
import assert from 'node:assert/strict';

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

test('settings：SCHEMA 默认值、持久化与 resetSettings', async () => {
    const { settings, resetSettings, blockWordList, makeBlockWordsFilter } = await import('@/core/settings.js');

    assert.equal(settings.codeWrap, true, '代码块默认换行');
    assert.equal(settings.dedupWindow, 100, '去重窗口默认 100');
    assert.equal(settings.answerSinglePage, false, '回答单页默认关，上下滑切换可用');

    settings.pageMargin = 32;
    settings.cardGap = 24;
    await tick();
    assert.equal(localStorage.getItem('app_settings'), null, '落盘按 300ms 合批，此刻还不该写');
    await new Promise((r) => setTimeout(r, 350));
    const saved = JSON.parse(localStorage.getItem('app_settings'));
    assert.equal(saved.pageMargin, 32, '改动应落盘');

    resetSettings(['pageMargin', 'cardGap']);
    assert.equal(settings.pageMargin, 16);
    assert.equal(settings.cardGap, 8);
    resetSettings(['不存在的键']);
    assert.equal(settings.pageMargin, 16, '未注册键应被忽略而不是抛错');

    settings.blockWords = '甲, 乙，甲\n丙';
    const words = blockWordList();
    assert.deepEqual(words, ['甲', '乙', '丙'], '去空去重，中英文逗号与换行都算分隔');

    const filter = makeBlockWordsFilter();
    assert.equal(filter({ title: '甲的内容' }), false);
    assert.equal(filter({ excerpt: '乙' }), false);
    assert.equal(filter({ title: '正常' }), true);
});

test('home-tabs：保存即落盘，未知栏目被丢弃，主页必须落在启用的栏目上', async () => {
    const { homeTabs, saveHomeTabs, HOME_TAB_IDS } = await import('@/core/home-tabs.js');

    saveHomeTabs({
        tabs: [{ id: 'hot', enabled: true }, { id: 'recommend', enabled: false }, { id: 'ghost', enabled: true }],
        default: 'recommend',
        defaultFollowing: 'timeline',
    });
    await tick();

    assert.deepEqual(homeTabs.tabs.map((t) => t.id).filter((id) => HOME_TAB_IDS.includes(id)),
        ['hot', 'recommend', 'following', 'thoughts'], '未知 id 丢弃，缺的栏目补回');
    assert.equal(homeTabs.default, '', '主页指向已禁用的栏目时应清空');
    assert.equal(homeTabs.defaultFollowing, 'timeline');

    const raw = JSON.parse(localStorage.getItem('home_tabs_config'));
    assert.equal(raw.defaultFollowing, 'timeline', '应写入 localStorage');
});

test('feed-dedup：窗口内去重、超限从头裁剪、0 为关闭', async () => {
    const { dedupFilter } = await import('@/services/feed-dedup.js');

    assert.equal(dedupFilter({ type: 'answer', id: '1' }, 2), true, '首次出现放行');
    assert.equal(dedupFilter({ type: 'answer', id: '1' }, 2), false, '重复出现过滤');
    assert.equal(dedupFilter({ type: 'pin', id: '1' }, 2), true, '同 id 不同类型互不影响');

    assert.equal(dedupFilter({ type: 'answer', id: 'x' }, 0), true, '窗口 0 不去重');
    assert.equal(dedupFilter({ type: 'answer', id: 'x' }, 0), true, '窗口 0 也不记录');

    assert.equal(dedupFilter({}, 5), true, '无 id 的条目放行');

    for (let i = 0; i < 5; i += 1) dedupFilter({ type: 'answer', id: `k${i}` }, 3);
    assert.equal(dedupFilter({ type: 'answer', id: 'k0' }, 3), true, '最早入窗的应已被裁剪掉，可再次出现');
});

test('feed-dedup：resetDedup 清空窗口并落盘（整表重取前调用）', async () => {
    const { dedupFilter, resetDedup } = await import('@/services/feed-dedup.js');

    assert.equal(dedupFilter({ type: 'answer', id: 'z' }, 50), true);
    assert.equal(dedupFilter({ type: 'answer', id: 'z' }, 50), false, '窗口内重复被过滤');

    resetDedup();
    assert.equal(dedupFilter({ type: 'answer', id: 'z' }, 50), true, '清空后同一条可再次出现');
    await tick();
    assert.equal(JSON.parse(localStorage.getItem('recommend_history')).length, 1, '清空与新增都要落盘');
});

test('scroll-store：写入、读取与清除', async () => {
    const { setScrollPosition, getScrollPosition, clearScrollPosition } = await import('@/services/scroll-store.js');

    setScrollPosition('/article/answer/1', 1700);
    assert.equal(getScrollPosition('/article/answer/1'), 1700);
    assert.equal(getScrollPosition('/article/answer/2'), 0, '无记录返回 0');

    clearScrollPosition('/article/answer/1');
    assert.equal(getScrollPosition('/article/answer/1'), 0);
    assert.equal(getScrollPosition(''), 0, '空 url 不应崩');
});

test('scroll-store：超过 10 天的记录读不到（模块首次读取时清理）', async () => {
    localStorage.setItem('scroll_positions', JSON.stringify({
        '/article/answer/old': { position: 900, timestamp: Date.now() - 11 * 24 * 3600 * 1000 },
        '/article/answer/new': { position: 800, timestamp: Date.now() },
    }));

    // 独立的 store 实例：上面那条已缓存，这里用子进程语义等价地验证一次读取期清理
    const { getScrollPosition } = await import('./helpers/fresh-scroll-store.mjs');
    assert.equal(getScrollPosition('/article/answer/new'), 800);
    assert.equal(getScrollPosition('/article/answer/old'), 0, '过期条目应被丢弃');
});

test('theme 配置：保存按补丁合并，多个页面各写各的键', async () => {
    const { saveThemeConfig, loadThemeConfig } = await import('@/composables/useTheme.js');

    saveThemeConfig({ color: 'red', darkMode: true });
    saveThemeConfig({ fontSize: '20px' });

    const cfg = loadThemeConfig();
    assert.equal(cfg.color, 'red', '后一次写入不该把前一次的键丢掉');
    assert.equal(cfg.darkMode, true);
    assert.equal(cfg.fontSize, '20px');

    saveThemeConfig({ color: 'blue' });
    assert.equal(loadThemeConfig().fontSize, '20px', '改色不该影响字号');
});

test('themeSettings：方案的两个布尔存法合成一个值，并收敛到支持的取值', async () => {
    localStorage.setItem('theme_config', JSON.stringify({ color: 'red', monochrome: true, vibrant: true }));
    const { themeSettings } = await import('@/composables/useThemeSettings.js');
    const { MD_SCHEMES, normalizeMdScheme } = await import('@/composables/useTheme.js');

    assert.equal(themeSettings.mdScheme, 'monochrome', '两个布尔都为真时落到单色');
    assert.equal(themeSettings.color, 'red');
    assert.deepEqual(MD_SCHEMES.map((s) => s.value), ['default', 'vibrant', 'monochrome'],
        '方案取值只能是文档列出的那三个');
    assert.equal(normalizeMdScheme('monochrome-vibrant'), 'monochrome');
    assert.equal(normalizeMdScheme('expressive'), 'default', 'F7 不认的名字不该传到 setMdColorScheme');
});
