// src/mappers/feed.js
// 首页各 feed 流的原始响应 → 卡片视图模型。
import { voteupOf, commentCountOf } from '@/mappers/zhihu-item.js';

const parseChineseNumber = (str) => {
    if (!str) return 0;
    const num = parseFloat(str);
    if (str.includes('万')) return Math.floor(num * 10000);
    if (str.includes('千')) return Math.floor(num * 1000);
    return Math.floor(num);
};

/** 推荐流单条（item.type === 'feed'），非 feed 返回 undefined */
export function mapRecommendItem(item) {
    if (item.type !== 'feed') return;

    const targetItem = item.target || item;
    const type = targetItem.type;
    const id = targetItem.id;
    const authorName = targetItem.author ? targetItem.author.name : '';

    let excerpt = targetItem.excerpt || targetItem.excerpt_title || '';
    let title = targetItem.title || item.title || '无标题';

    switch (type) {
        case 'answer':
            title = targetItem.question ? targetItem.question.title : title;
            break;
        case 'pin':
            title = `${authorName}发表了想法`;
            break;
    }

    if (!excerpt || excerpt.trim() === '' || excerpt === '无预览内容') {
        excerpt = null;
    }

    return {
        type,
        id,
        title,
        excerpt,
        authorName,
        // 已读上报回给服务端的凭证，接口原样下发
        brief: item.brief,
        metrics: {
            likes: voteupOf(targetItem),
            comments: commentCountOf(targetItem),
        },
    };
}

/** 关注流 moments_feed 单条 */
export function mapMomentsFeed(item) {
    const source = item.source || {};
    const actor = source.actor || {};
    const targetItem = item.target || item;

    const type = targetItem.type === 'moments_pin' ? 'pin' : targetItem.type;
    const authorName = actor.name || '未知用户';
    const preview = targetItem.preview || '';

    let title = targetItem.title || targetItem.excerpt_title || '';
    let excerpt = targetItem.excerpt || '';

    switch (type) {
        case 'answer':
            title = targetItem.question?.title || title;
            break;
        case 'pin':
            title = title || '一个想法';
            if (targetItem.content && targetItem.content.length > 0) {
                excerpt = targetItem.content[0].content || excerpt;
                if (!excerpt && targetItem.content.some(c => c.type === 'image')) {
                    excerpt = '[图片]';
                }
            }
            break;
        case 'zvideo':
            excerpt = preview || targetItem.description || '[视频]';
            break;
    }

    if (preview && preview !== '[视频]') {
        excerpt = `${authorName}: ${excerpt}`;
    }

    return {
        id: targetItem.id,
        type,
        title,
        excerpt,
        authorName,
        avatarUrl: targetItem.author?.avatar_url || actor.avatar_url,
        actionText: source.action_text || '',
        timeText: source.action_time ? new Date(source.action_time * 1000).toLocaleDateString() : '',
        metrics: {
            likes: targetItem.voteup_count || targetItem.reaction_count || 0,
            comments: targetItem.comment_count || 0,
        },
    };
}

/** 关注流 feed_item_index_group 单条（也用于折叠组的子项） */
export function mapFeedItemIndexGroup(item) {
    const targetItem = item.target || item;
    const type = targetItem.type === 'moments_pin' ? 'pin' : targetItem.type;

    let avatarUrl, authorName, actionText;
    if (item.actors && item.actors.length > 0) {
        avatarUrl = item.actors[0].avatar_url;
        authorName = item.actors[0].name;
        actionText = authorName + (item.action_text || '');
    } else {
        authorName = targetItem.author?.name || '未知用户';
        actionText = '';
        avatarUrl = '';
    }

    const timeText = item.action_time ? new Date(item.action_time * 1000).toLocaleDateString() : '';
    let title = targetItem.title || targetItem.excerpt_title || '';
    let excerpt = targetItem.digest || '';

    let likes = 0;
    let comments = 0;
    if (targetItem.desc) {
        const descMatch = targetItem.desc.match(/(\d+(?:\.\d+)?[万千]?)\s*赞同/);
        if (descMatch) likes = parseChineseNumber(descMatch[1]);
        const commentMatch = targetItem.desc.match(/(\d+(?:\.\d+)?[万千]?)\s*评论/);
        if (commentMatch) comments = parseChineseNumber(commentMatch[1]);
    }

    let id = targetItem.id;
    switch (type) {
        case 'pin':
            title = title || '一个想法';
            break;
        case 'zvideo':
            if (!excerpt) excerpt = '[视频]';
            break;
        case 'drama':
            if (!excerpt) excerpt = '[直播]';
            break;
        case 'people': {
            const cardExtentData = targetItem.card_extend_data || {};
            authorName = cardExtentData.name;
            title = cardExtentData.description;
            avatarUrl = cardExtentData.avatar_url;
            excerpt = cardExtentData.headline;
            id = cardExtentData.id || id;
            break;
        }
    }

    if (excerpt && excerpt !== '[视频]' && excerpt !== '[直播]') {
        excerpt = `${authorName} : ${excerpt}`;
    }

    return {
        id,
        type,
        title,
        excerpt,
        authorName,
        avatarUrl,
        actionText,
        timeText,
        unfoldShowSize: item.unfold_show_size || 0,
        metrics: { likes, comments },
    };
}

/** 想法流单条 */
export function mapThoughtItem(item) {
    const targetItem = item.target || item;
    const excerpt = targetItem.excerpt || '';
    const authorName = targetItem.author?.name || '匿名用户';

    let image = '';
    if (targetItem.images && targetItem.images.length > 0) {
        image = targetItem.images[0].url;
    } else if (targetItem.video && targetItem.video.thumbnail) {
        image = targetItem.video.thumbnail;
    }

    const firstLine = excerpt.split('\n')[0].trim();
    const title = !excerpt ? '一个想法'
        : (firstLine.length > 30 ? firstLine.substring(0, 30) + '...' : firstLine);

    return {
        id: targetItem.id,
        title,
        excerpt,
        image,
        authorName,
        type: 'pin',
        metrics: {
            likes: targetItem.reaction?.statistics?.up_vote_count || 0,
            comments: targetItem.reaction?.statistics?.comment_count || 0,
        },
    };
}

/** 热榜单条 */
export function mapHotItem(item, index) {
    const target = item.target || {};
    return {
        id: item.card_id || `hot-${index}`,
        rank: index + 1,
        title: target.title_area?.text || '无标题',
        metricsArea: target.metrics_area?.text || '',
        url: target.link?.url || '',
        thumbnailSrc: target.image_area?.url || '',
    };
}
