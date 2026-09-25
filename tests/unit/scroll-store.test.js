import { test } from 'node:test';
import assert from 'node:assert/strict';

const DAY = 24 * 60 * 60 * 1000;

// 存储要先种再 import：模块在加载时读一次并做过期清理
test('scroll-store：过期与脏条目在装载时被丢掉，读写与清除按 URL', async () => {
    const now = Date.now();
    localStorage.setItem('scroll_positions', JSON.stringify({
        '/fresh': { position: 1700, timestamp: now - DAY },
        '/stale': { position: 900, timestamp: now - 11 * DAY },
        '/broken': { position: 'x', timestamp: now },
        '/no-ts': { position: 50 },
    }));

    const { getScrollPosition, setScrollPosition, clearScrollPosition } = await import('@/services/scroll-store.js');

    assert.equal(getScrollPosition('/fresh'), 1700);
    assert.equal(getScrollPosition('/stale'), 0, '10 天前的记录应失效');
    assert.equal(getScrollPosition('/broken'), 0, 'position 不是数字应丢掉');
    assert.equal(getScrollPosition('/no-ts'), 0, '缺 timestamp 按过期处理');
    assert.equal(getScrollPosition(''), 0, '空 URL 直接回 0');

    setScrollPosition('/new', 42);
    assert.equal(getScrollPosition('/new'), 42);
    assert.equal(JSON.parse(localStorage.getItem('scroll_positions'))['/new'].position, 42, '写内存同时要落盘');

    setScrollPosition('', 7);
    assert.equal(JSON.parse(localStorage.getItem('scroll_positions'))[''], undefined, '空 URL 不该写入');

    clearScrollPosition('/new');
    assert.equal(getScrollPosition('/new'), 0);
    assert.equal('/new' in JSON.parse(localStorage.getItem('scroll_positions')), false, '清除要落盘');

    clearScrollPosition('/never-existed');
    assert.ok(localStorage.getItem('scroll_positions'), '清不存在的键不该把整表写坏');
});
