// 命令式创建的 F7 弹窗收尾：close() 只把元素隐藏，destroy() 也不从 document 摘掉它，
// 所以每打开一次就在页面上留一份节点。关闭动画结束后销毁实例并摘除元素。
export function destroyOnClosed(modal) {
    modal.once('closed', () => {
        const el = modal.el;
        modal.destroy();
        el?.remove();
    });
    return modal;
}
