// 分页引擎：runPagedLoad 与 makeListMapper 是单列表与多 Tab 共用的那一份，
// 游标翻页、刷新替换、过滤装配、过期写入都在这里判定。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computed, ref } from 'vue';

import { runPagedLoad, makeListMapper, emptyPage } from '@/composables/usePagedList.js';

/** 造一个 PaginatedResult 替身：只有引擎用到的 data/hasMore/next 三个成员 */
function fakePages(pages) {
    let index = 0;
    const make = (payload) => ({
        data: payload.data,
        hasMore: !payload.is_end,
        next: async () => {
            index += 1;
            return index < pages.length ? make(pages[index]) : null;
        },
    });
    return () => make(pages[index]);
}

const passthrough = (raw) => raw;

test('首页加载填充列表并记住游标', async () => {
    const page = emptyPage();
    const fetch = fakePages([
        { data: ['a', 'b'], is_end: false },
        { data: ['c'], is_end: true },
    ]);

    await runPagedLoad(page, false, { fetch, mapList: passthrough });
    assert.deepEqual(page.list, ['a', 'b']);
    assert.equal(page.hasMore, true);
    assert.ok(page.lastResult, '应留存游标供下次翻页');
});

test('翻页沿游标续取并追加，到底后置灰 hasMore', async () => {
    const page = emptyPage();
    const fetch = fakePages([
        { data: ['a', 'b'], is_end: false },
        { data: ['c'], is_end: true },
    ]);

    await runPagedLoad(page, false, { fetch, mapList: passthrough });
    await runPagedLoad(page, false, { fetch, mapList: passthrough });
    assert.deepEqual(page.list, ['a', 'b', 'c'], '顺序为追加而非替换');
    assert.equal(page.hasMore, false);

    await runPagedLoad(page, false, { fetch, mapList: passthrough });
    assert.deepEqual(page.list, ['a', 'b', 'c'], '没有下一页时不再改动列表');
});

test('下拉刷新重取首页并整页替换', async () => {
    const page = emptyPage();
    let call = 0;
    const fetch = async () => {
        call += 1;
        const first = call;
        return { data: [first], hasMore: true, next: async () => ({ data: [first * 10], hasMore: true }) };
    };

    await runPagedLoad(page, false, { fetch, mapList: passthrough });
    await runPagedLoad(page, false, { fetch, mapList: passthrough });
    assert.deepEqual(page.list, [1, 10]);

    await runPagedLoad(page, true, { fetch, mapList: passthrough });
    assert.deepEqual(page.list, [2], '刷新结果不接在旧数据后面');
});

test('取回 null 时判定为没有更多，且不追加', async () => {
    const page = emptyPage();
    await runPagedLoad(page, false, { fetch: async () => null, mapList: passthrough });
    assert.deepEqual(page.list, []);
    assert.equal(page.hasMore, false);
});

test('请求抛错时保留已有数据并把错误交给 onError', async () => {
    const page = { list: ['keep'], hasMore: true, lastResult: null };
    let caught = null;

    await runPagedLoad(page, false, {
        fetch: async () => { throw new Error('网络错误'); },
        mapList: passthrough,
        onError: (e) => { caught = e; },
    });
    assert.equal(caught.message, '网络错误');
    assert.deepEqual(page.list, ['keep'], '失败不清空列表');
    assert.equal(page.hasMore, true, '失败不改分页状态');
});

test('组件已卸载时丢弃在途结果', async () => {
    const page = emptyPage();
    await runPagedLoad(page, false, {
        fetch: async () => ({ data: ['x'], hasMore: true }),
        mapList: passthrough,
        isAlive: () => false,
    });
    assert.deepEqual(page.list, [], '过期结果不写入');
    assert.equal(page.hasMore, true, '维持初始状态');
});

test('续取用本次加载的 signal，不复用游标上恢复来的旧 signal', async () => {
    const seen = [];
    const page = {
        list: ['a'],
        hasMore: true,
        lastResult: { hasMore: true, next: async (overrides) => { seen.push(overrides?.signal); return { data: ['b'], hasMore: false }; } },
    };
    const signal = new AbortController().signal;
    await runPagedLoad(page, false, { fetch: async () => null, mapList: passthrough, signal });
    assert.deepEqual(page.list, ['a', 'b']);
    assert.equal(seen[0], signal, '本次 signal 应覆盖游标里那个');
});

test('刷新期间在途的旧结果按代号丢弃', async () => {
    // 引擎的丢弃靠 isAlive 判定：runPagedLoad 只认传进来的守卫
    const page = { list: ['keep'], hasMore: true, lastResult: null };
    await runPagedLoad(page, false, {
        fetch: async () => ({ data: ['new'], hasMore: true }),
        mapList: passthrough,
        isAlive: () => false,
    });
    assert.deepEqual(page.list, ['keep'], '守卫判过期时不写入');
});

test('map 与 filter 装配：映射去空后按动态过滤函数筛', async () => {
    const blocked = ref(new Set(['banned']));
    const mapper = makeListMapper({
        map: (raw, tabId) => (raw.id === 'ghost' ? null : { id: raw.id, tabId }),
        filter: computed(() => (item) => !blocked.value.has(item.id)),
    });

    const mapList = mapper('hot');
    const out = mapList([{ id: 'a' }, { id: 'ghost' }, { id: 'banned' }], { hasMore: false });
    assert.deepEqual(out, [{ id: 'a', tabId: 'hot' }], 'null 被去掉，禁用项被过滤，tabId 透传');

    blocked.value = new Set();
    assert.deepEqual(mapList([{ id: 'banned' }]).map((i) => i.id), ['banned'],
        '过滤条件变了应在下次加载即生效');
});

test('mapList 覆写时拿到原始 res，可按响应体补游标信息', async () => {
    const seen = [];
    const mapper = makeListMapper({
        mapList: (raw, tabId, res) => {
            seen.push([raw.length, tabId, res.marker]);
            return raw;
        },
    });
    mapper('thoughts')([1, 2], { marker: 'm' });
    assert.deepEqual(seen, [[2, 'thoughts', 'm']]);
});

test('加载失败：页面没给 onError 时统一弹中文提示，取消与自带提示的页面不重复弹', async () => {
    const { f7calls, resetF7Calls } = await import('framework7-vue');
    const toasts = () => f7calls.filter((c) => c.kind === 'toast');

    resetF7Calls();
    await runPagedLoad(emptyPage(), false, {
        fetch: () => Promise.reject(new Error('请求超时，请检查网络后重试')),
        mapList: passthrough,
    });
    assert.equal(toasts()[0]?.text, '请求超时，请检查网络后重试', '失败原因要能看见');

    resetF7Calls();
    const abort = new Error('signal is aborted without reason');
    abort.name = 'AbortError';
    await runPagedLoad(emptyPage(), false, { fetch: () => Promise.reject(abort), mapList: passthrough });
    assert.equal(toasts().length, 0, '主动取消不是失败，不该提示');

    resetF7Calls();
    let seen = null;
    await runPagedLoad(emptyPage(), false, {
        fetch: () => Promise.reject(new Error('页面自处理')),
        mapList: passthrough,
        onError: (e) => { seen = e.message; },
    });
    assert.equal(seen, '页面自处理');
    assert.equal(toasts().length, 0, '自带提示的页面不该再被引擎弹一条');
});

test('请求层已就地提示过的错误（notified），引擎不再重复弹一条', async () => {
    const { f7calls, resetF7Calls } = await import('framework7-vue');
    resetF7Calls();
    const err = new Error('权限不足');
    err.status = 403;
    err.notified = true;
    await runPagedLoad(emptyPage(), false, { fetch: () => Promise.reject(err), mapList: passthrough });
    assert.equal(f7calls.filter((c) => c.kind === 'toast').length, 0, '同一次失败只该出现一条提示');
});
