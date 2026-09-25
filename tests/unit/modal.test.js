import { test } from 'node:test';
import assert from 'node:assert/strict';

import { destroyOnClosed } from '@/utils/modal.js';

/** F7 弹窗实例的最小替身：只关心 once('closed') 之后做了什么 */
function fakeModal() {
    const el = { removed: false, remove() { this.removed = true; } };
    return {
        el,
        handlers: {},
        destroyed: false,
        once(name, fn) { this.handlers[name] = fn; },
        destroy() { this.destroyed = true; },
    };
}

test('closed 之后销毁实例并摘掉元素', () => {
    const modal = fakeModal();
    destroyOnClosed(modal);
    assert.equal(modal.destroyed, false, '还没关闭时不该动它');

    modal.handlers.closed();
    assert.equal(modal.destroyed, true, 'F7 的 destroy() 不摘 DOM，要自己 remove');
    assert.equal(modal.el.removed, true, '节点必须从 document 上摘掉');
});

test('返回值就是实例本身，可以链式 open', () => {
    const modal = fakeModal();
    assert.equal(destroyOnClosed(modal), modal);
});
