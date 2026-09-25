// src/mappers/zhihu-item.js
// 知乎条目字段归一：同类内容在不同接口里字段名/嵌套层级各异，这里是唯一去噪出口。

const TYPE_ALIAS = {
    moments_pin: 'pin',
    pin_general: 'pin',
    favlist: 'collection',
};

/** 剥掉 target / object / collection 外层包装，取真正的内容对象 */
export function unwrap(item) {
    return item?.target || item?.object || item?.collection || item;
}

/** 类型别名归一（moments_pin/pin_general→pin、favlist→collection） */
export function normalizeType(type) {
    return TYPE_ALIAS[type] || type;
}

/** 标题：answer 取所属问题标题，其余取 title/name，pin 兜底「一个想法」 */
export function titleOf(obj, fallback = '') {
    const type = normalizeType(obj?.type);
    if (type === 'answer') return obj.question?.title || fallback || '无标题';
    if (type === 'pin') return obj.title || obj.excerpt_title || fallback || '一个想法';
    return obj?.title || obj?.name || fallback;
}

/** 摘要：多源兜底 */
export function excerptOf(obj) {
    return obj?.excerpt || obj?.excerpt_title || obj?.description || '';
}

/** 赞同数：兼容 voteup_count / vote_count / reaction_count / reaction.statistics 嵌套 */
export function voteupOf(obj) {
    return obj?.voteup_count
        ?? obj?.vote_count
        ?? obj?.reaction_count
        ?? obj?.reaction?.statistics?.up_vote_count
        ?? 0;
}

/** 评论数 */
export function commentCountOf(obj) {
    return obj?.comment_count ?? obj?.reaction?.statistics?.comment_count ?? 0;
}

/** 作者对象归一 */
export function authorOf(obj) {
    const a = obj?.author || obj?.actor || {};
    return {
        id: a.id,
        name: a.name || '匿名用户',
        avatarUrl: a.avatar_url,
        urlToken: a.url_token,
        headline: a.headline || '',
    };
}

/** 用户对象归一：@搜索与关注/粉丝列表直接回用户，个别端点在外面包一层 member */
export function userOf(obj) {
    const u = obj?.member || obj || {};
    return {
        id: u.id ? String(u.id) : '',
        name: u.name || '匿名用户',
        avatarUrl: u.avatar_url || '',
        urlToken: u.url_token || '',
        headline: u.headline || '',
    };
}
