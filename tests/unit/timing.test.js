import { test } from 'node:test';
import assert from 'node:assert/strict';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test('debounce：窗口内只执行一次并带最后一次参数，cancel 可截断', async () => {
    const { debounce } = await import('@/utils/timing.js');
    const calls = [];
    const fn = debounce((...args) => calls.push(args), 20);

    fn(1);
    fn(2);
    fn(3);
    assert.equal(calls.length, 0, '窗口内不该执行');
    await wait(40);
    assert.deepEqual(calls, [[3]], '只留最后一次');

    const cancelled = [];
    const fn2 = debounce((v) => cancelled.push(v), 20);
    fn2('a');
    fn2.cancel();
    await wait(40);
    assert.deepEqual(cancelled, [], 'cancel 之后不再执行');
});

test('throttle：首次立即执行，窗口内丢弃，窗口过后放行', async () => {
    const { throttle } = await import('@/utils/timing.js');
    const hits = [];
    const fn = throttle((v) => hits.push(v), 30);

    fn('first');
    assert.deepEqual(hits, ['first'], '首次要立即执行');
    fn('dropped');
    assert.deepEqual(hits, ['first'], '窗口内的调用应被丢弃');
    await wait(40);
    fn('after');
    assert.deepEqual(hits, ['first', 'after']);
});
