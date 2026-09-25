import { test } from 'node:test';
import assert from 'node:assert/strict';

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

// 先种存储再 import：模块在加载时把落盘窗口读成内存集合
test('feed-dedup：窗口语义、超限淘汰与合批落盘', async () => {
    localStorage.setItem('recommend_history', JSON.stringify(['a:1']));
    const { dedupFilter, resetDedup } = await import('@/services/feed-dedup.js');

    assert.equal(dedupFilter({ type: 'a', id: 1 }, 0), true, 'limit 0 表示关闭去重');
    assert.equal(dedupFilter({ type: 'a', id: 1 }, 0), true, '关掉时同一条重复出现也放行');
    assert.equal(dedupFilter({ type: 'a', id: 1 }, 100), false, '已存的键在开启后应被判重');

    assert.equal(dedupFilter({ type: 'a', id: 2 }, 2), true);
    assert.equal(dedupFilter({ type: 'a', id: 3 }, 2), true, '超出窗口时挤掉最旧的 a:1');
    assert.equal(dedupFilter({ type: 'a', id: 2 }, 2), false, '仍在窗口内的要拦住');
    assert.equal(dedupFilter({ type: 'a', id: 1 }, 2), true, '被挤掉的键重新出现应放行');

    assert.equal(dedupFilter({ type: 'b' }, 100), true, '缺 id 的条目不参与去重');
    assert.equal(dedupFilter(null, 100), true, '空条目不该抛错');

    await tick();
    assert.deepEqual(JSON.parse(localStorage.getItem('recommend_history')), ['a:3', 'a:1'],
        '窗口只留最后 limit 条并按序落盘');

    resetDedup();
    assert.equal(dedupFilter({ type: 'a', id: 1 }, 100), true, '清空后同一条应重新放行');
    await tick();
    assert.deepEqual(JSON.parse(localStorage.getItem('recommend_history')), ['a:1']);
});
