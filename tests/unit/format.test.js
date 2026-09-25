import { test } from 'node:test';
import assert from 'node:assert/strict';

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

test('formatCount：一万以上折算，脏值回 0', async () => {
    const { formatCount } = await import('@/utils/format.js');

    assert.equal(formatCount(0), '0');
    assert.equal(formatCount(9999), '9999');
    assert.equal(formatCount(10000), '1.0万');
    assert.equal(formatCount(12345), '1.2万');
    assert.equal(formatCount('25000'), '2.5万', '字符串数字也要能折算');
    assert.equal(formatCount(undefined), '0');
    assert.equal(formatCount('abc'), '0', '脏值不该冒出 NaN');
});

test('formatRelativeTime：分钟/小时/日期三档，秒与毫秒时间戳都吃', async () => {
    const { formatRelativeTime } = await import('@/utils/format.js');
    const now = Date.now();
    const pad = (n) => String(n).padStart(2, '0');
    const md = (t) => `${pad(new Date(t).getMonth() + 1)}-${pad(new Date(t).getDate())}`;

    assert.equal(formatRelativeTime(0), '');
    assert.equal(formatRelativeTime(undefined), '');
    assert.equal(formatRelativeTime(now - 5 * 1000), '刚刚');
    assert.equal(formatRelativeTime(now - 5 * MIN), '5 分钟前');
    assert.equal(formatRelativeTime((now - 5 * MIN) / 1000), '5 分钟前', '秒级时间戳同结果');
    assert.equal(formatRelativeTime(now - 2 * HOUR), '2 小时前');
    assert.equal(formatRelativeTime(now - 3 * DAY), md(now - 3 * DAY));
    assert.equal(formatRelativeTime(now - 400 * DAY), `${new Date(now - 400 * DAY).getFullYear()}-${md(now - 400 * DAY)}`,
        '跨年要带年份');
    assert.equal(formatRelativeTime(now + HOUR), '刚刚', '未来时间戳不该产生负数');
});

test('formatRelativeTime：非数字入参回空串而不是 NaN-NaN', async () => {
    const { formatRelativeTime } = await import('@/utils/format.js');

    assert.equal(formatRelativeTime('abc'), '');
    assert.equal(formatRelativeTime({}), '');
});
