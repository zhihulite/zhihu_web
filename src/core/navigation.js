// src/core/navigation.js
// 卡片跳转的路由解析：把 { type, id } 归一化为站内路由或外链动作。
import { parseZhihuUrl } from '@/utils/url.js';
import { requestLogin } from '@/core/login-dialog.js';

const openLink = (url) => window.open(url, '_blank', 'noopener,noreferrer');

/**
 * 解析卡片点击目标。
 * @param {{type:string,id:string}} item
 * @returns {{kind:'route',path:string}|{kind:'external',url:string}|{kind:'login'}}
 */
export function resolveCardRoute(item) {
    const { type, id } = item;
    switch (type) {
        case 'question': return { kind: 'route', path: `/question/${id}` };
        case 'people': return { kind: 'route', path: `/user/${id}` };
        case 'zvideo': return { kind: 'route', path: `/video/${id}` };
        case 'column': return { kind: 'route', path: `/column-items/${item.id}` };
        case 'topic': return { kind: 'route', path: `/topic/${id}` };
        case 'collection': return { kind: 'route', path: `/collection/${id}` };
        case 'roundtable': return { kind: 'external', url: `https://www.zhihu.com/roundtable/${item.id}` };
        case 'special': return { kind: 'external', url: `https://www.zhihu.com/special/${item.id}` };
        case 'drama': return { kind: 'external', url: `https://www.zhihu.com/theater/${id}` };
        case 'browser': return { kind: 'external', url: id };
        case 'login': return { kind: 'login' };
        default: return { kind: 'route', path: `/article/${type}/${id}` };
    }
}

/** 卡片点击的默认执行：站内跳转走 f7router，登录链接开登录框，其余外链新开窗口 */
export function handleCardClick(f7router, item) {
    const target = resolveCardRoute(item);
    if (target.kind === 'route') f7router.navigate(target.path);
    else if (target.kind === 'login') requestLogin();
    else openLink(target.url);
}

/** 解析知乎链接并跳转，返回解析结果供调用方判断是否命中 */
export async function handleZhihuUrl(f7router, url) {
    const result = await parseZhihuUrl(url);
    if (result.type !== 'error') handleCardClick(f7router, result);
    return result;
}

export { openLink };
