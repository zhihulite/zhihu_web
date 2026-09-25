import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
    unwrap, normalizeType, titleOf, excerptOf, voteupOf, commentCountOf, authorOf,
} from '@/mappers/zhihu-item.js';
import {
    mapRecommendItem, mapHotItem, mapThoughtItem, mapMomentsFeed, mapFeedItemIndexGroup,
} from '@/mappers/feed.js';

test('unwrap 依次剥 target/object/collection 包装', () => {
    assert.equal(unwrap({ target: { id: 1 } }).id, 1);
    assert.equal(unwrap({ object: { id: 2 } }).id, 2);
    assert.equal(unwrap({ collection: { id: 3 } }).id, 3);
    assert.equal(unwrap({ id: 4 }).id, 4);
    assert.equal(unwrap(undefined), undefined);
});

test('normalizeType 归一三种别名', () => {
    assert.equal(normalizeType('moments_pin'), 'pin');
    assert.equal(normalizeType('pin_general'), 'pin');
    assert.equal(normalizeType('favlist'), 'collection');
    assert.equal(normalizeType('answer'), 'answer');
});

test('voteupOf 兼容四五种字段位置', () => {
    assert.equal(voteupOf({ voteup_count: 5 }), 5);
    assert.equal(voteupOf({ vote_count: 6 }), 6);
    assert.equal(voteupOf({ reaction_count: 7 }), 7);
    assert.equal(voteupOf({ reaction: { statistics: { up_vote_count: 8 } } }), 8);
    assert.equal(voteupOf({}), 0, '缺字段应给 0 而不是 undefined');
    assert.equal(voteupOf(undefined), 0);
});

test('commentCountOf 与 authorOf 的兜底', () => {
    assert.equal(commentCountOf({ comment_count: 3 }), 3);
    assert.equal(commentCountOf({ reaction: { statistics: { comment_count: 4 } } }), 4);
    assert.equal(commentCountOf({}), 0);
    assert.deepEqual(authorOf({ actor: { name: '甲' } }).name, '甲');
    assert.equal(authorOf({}).name, '匿名用户');
});

test('titleOf 按类型取不同来源', () => {
    assert.equal(titleOf({ type: 'answer', question: { title: '问题' } }), '问题');
    assert.equal(titleOf({ type: 'pin' }), '一个想法');
    assert.equal(titleOf({ type: 'article', title: '文章' }), '文章');
    assert.equal(titleOf({ type: 'people', name: '用户' }), '用户');
});

test('mapRecommendItem 只吃 feed 类型并透传已读上报凭证 brief', () => {
    assert.equal(mapRecommendItem({ type: 'ad' }), undefined);
    const mapped = mapRecommendItem({
        type: 'feed',
        brief: { actionType: 'answer', uuid: 9 },
        target: {
            type: 'answer', id: 'a1', excerpt: '摘要',
            author: { name: '甲' }, question: { title: '问题标题' },
            voteup_count: 12, comment_count: 2,
        },
    });
    assert.equal(mapped.type, 'answer');
    assert.equal(mapped.id, 'a1');
    assert.equal(mapped.title, '问题标题');
    assert.equal(mapped.metrics.likes, 12);
    assert.deepEqual(mapped.brief, { actionType: 'answer', uuid: 9 });
});

test('mapHotItem 不再假定卡片一定是问题，缺 card_id 也能给出稳定键', () => {
    const [q, noId] = [
        { card_id: 'Q_100', target: { title_area: { text: '标题' }, link: { url: 'https://www.zhihu.com/question/100' } } },
        { target: { title_area: { text: '无 id 的卡片' } } },
    ].map((raw, i) => mapHotItem(raw, i));

    assert.equal(q.id, 'Q_100');
    assert.equal(q.url, 'https://www.zhihu.com/question/100');
    assert.equal(q.rank, 1);
    assert.equal(noId.id, 'hot-1', '缺 card_id 时退到位置键，不应抛错');
    assert.equal(noId.url, '');
});

test('mapThoughtItem 取首行为标题并带出配图', () => {
    const mapped = mapThoughtItem({
        target: {
            id: 'p1', excerpt: '第一行\n第二行',
            author: { name: '乙' },
            images: [{ url: 'https://x/1.png' }],
            reaction: { statistics: { up_vote_count: 3, comment_count: 1 } },
        },
    });
    assert.equal(mapped.type, 'pin');
    assert.equal(mapped.title, '第一行');
    assert.equal(mapped.image, 'https://x/1.png');
    assert.equal(mapped.metrics.likes, 3);
});

test('mapMomentsFeed 拼作者与动作文案', () => {
    const mapped = mapMomentsFeed({
        source: { actor: { name: '丙', avatar_url: 'https://x/a.png' }, action_text: '赞同了回答' },
        target: { type: 'answer', id: 'a9', question: { title: '被赞同的回答' } },
    });
    assert.equal(mapped.authorName, '丙');
    assert.equal(mapped.actionText, '赞同了回答');
    assert.equal(mapped.id, 'a9');
});

test('mapFeedItemIndexGroup：无 actors 时取作者对象的 name，people 卡片缺扩展字段不抛错', () => {
    const noActors = mapFeedItemIndexGroup({
        target: { type: 'answer', id: 'a1', title: '标题', digest: '摘要', author: { name: '甲', avatar_url: '' } },
    });
    assert.equal(noActors.authorName, '甲', 'author 是对象，取 name');
    assert.equal(noActors.excerpt, '甲 : 摘要', '作者前缀不能是 [object Object]');

    const people = mapFeedItemIndexGroup({ target: { type: 'people', id: 'p1' } });
    assert.equal(people.id, 'p1', '没有 card_extend_data 时保留外层 id');
    assert.doesNotThrow(() => mapFeedItemIndexGroup({ target: { type: 'people' } }));
});

test('mapFeedItemIndexGroup 缺 desc 时指标为 0，不抛错', () => {
    const mapped = mapFeedItemIndexGroup({
        actors: [{ name: '丁', avatar_url: '' }],
        target: { type: 'article', id: 'x1', title: '标题', desc: '1.2万 赞同 · 34 评论' },
    });
    assert.equal(mapped.metrics.likes, 12000);
    assert.equal(mapped.metrics.comments, 34);
    assert.equal(mapped.authorName, '丁');
});
