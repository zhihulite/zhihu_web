// framework7-vue 的替身：node 里没有可挂载的 DOM，真实 f7 实例也就不存在，
// 而被测代码只用到 toast / dialog 这类命令式 API。
// 弹窗回调不自动触发：确认后的动作多为异步重建，自动跑会让它溢出到下一个用例，
// 用例需要时显式调用记录里的 invoke()。
export const f7calls = [];

const recordModal = (kind, text, title, onOk) => {
    const args = typeof title === 'function' ? { text, title: '' } : { text, title };
    const callback = typeof onOk === 'function' ? onOk : (typeof title === 'function' ? title : null);
    const entry = { kind, ...args, invoke: () => callback && callback() };
    f7calls.push(entry);
    return entry;
};

export const f7 = {
    toast: {
        show: (opts) => { f7calls.push({ kind: 'toast', ...opts }); return { close() { } }; },
    },
    dialog: {
        alert: (text, title, onOk) => ({ entry: recordModal('alert', text, title, onOk), close() { } }),
        confirm: (text, title, onOk) => ({ entry: recordModal('confirm', text, title, onOk), close() { } }),
    },
    views: { main: null },
};

/** 最近一条弹窗记录（alert / confirm），供用例触发确认回调 */
export function lastModal() {
    for (let i = f7calls.length - 1; i >= 0; i -= 1) {
        if (f7calls[i].kind === 'alert' || f7calls[i].kind === 'confirm') return f7calls[i];
    }
    return null;
}

export function resetF7Calls() {
    f7calls.length = 0;
}
