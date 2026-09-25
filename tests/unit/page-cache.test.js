import { test } from 'node:test';
import assert from 'node:assert/strict';

test('page-cache：按 routeId 合并补丁，prune 只留存活路由', async () => {
    const { pageCache } = await import('@/services/page-cache.js');

    pageCache.save('r1', { list: [1, 2] });
    pageCache.save('r1', { scroll: 300 });
    assert.deepEqual(pageCache.get('r1'), { list: [1, 2], scroll: 300 }, '第二次 save 应合并而不是覆盖');

    pageCache.save('r2', { list: [] });
    pageCache.save('', { list: [] });
    pageCache.save('r3', { list: [] });
    assert.equal(pageCache.get(''), undefined, '空 routeId 不入库');
    assert.equal(pageCache.get('missing'), undefined);

    pageCache.prune(['r1', 'r2']);
    assert.ok(pageCache.get('r1') && pageCache.get('r2'), '存活路由要留着');
    assert.equal(pageCache.get('r3'), undefined, '不在返回栈里的要被清掉');

    const ref = { lastResult: { hasMore: true } };
    pageCache.save('r4', ref);
    assert.equal(pageCache.get('r4').lastResult, ref.lastResult, '存的是引用，不是序列化副本');
});
