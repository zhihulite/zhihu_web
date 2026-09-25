import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const INDEX = 'saved_content';
const contentKey = (type, id) => `zhihu_saved_${type}_${id}`;

let svc;
const load = async () => { svc = await import('@/services/local-save.js'); };
await load();

const segs = () => [
    { type: 'paragraph', paragraph: { text: '第一段' } },
    { type: 'image', image: { urls: ['https://pica.zhimg.com/a.jpg'], width: 1000, height: 600 } },
    { type: 'heading', heading: { text: '小标题', level: 2 } },
];

beforeEach(async () => {
    localStorage.clear();
    await load();
});

test('saveContent：图片分段整段丢掉，其余分段保留并重排 _index', async () => {
    const { ok, record } = svc.saveContent({ type: 'answer', id: 12345, title: 'T', authorName: 'A', segments: segs() });

    assert.equal(ok, true);
    assert.deepEqual(record.segments.map((s) => s.type), ['paragraph', 'heading']);
    assert.deepEqual(record.segments.map((s) => s._index), [0, 1], '下标要按剔除后的顺序重排，渲染锚点才不错位');
    assert.equal(record.droppedImages, 1);
    assert.equal(record.id, '12345', 'id 统一成字符串，索引与正文键才对得上');
});

test('saveContent：索引只放列表页要的少量字段', () => {
    svc.saveContent({ type: 'answer', id: 1, title: 'T', authorName: 'A', questionID: 'q9', segments: segs() });
    const [entry] = JSON.parse(localStorage.getItem(INDEX));

    assert.deepEqual(Object.keys(entry).sort(), ['authorName', 'droppedImages', 'id', 'savedAt', 'segCount', 'title', 'type']);
    assert.equal(entry.segCount, 2);
    assert.equal(entry.droppedImages, 1);
    assert.equal(JSON.parse(localStorage.getItem(contentKey('answer', 1))).questionID, 'q9', '正文记录里保留 questionID 供回源用');
});

test('saveContent：同一条重复保存覆盖而不追加', () => {
    const one = svc.saveContent({ type: 'answer', id: 7, title: '旧', authorName: 'A', segments: segs() });
    const two = svc.saveContent({ type: 'answer', id: 7, title: '新', authorName: 'A', segments: segs() });

    assert.equal(JSON.parse(localStorage.getItem(INDEX)).length, 1);
    assert.equal(JSON.parse(localStorage.getItem(INDEX))[0].title, '新');
    assert.equal(svc.getSaved('answer', 7).title, '新');
    assert.ok(two.record.savedAt >= one.record.savedAt);
});

test('saveContent：没有可保存的文字正文时不写盘', () => {
    const onlyImage = [segs()[1]];
    const r1 = svc.saveContent({ type: 'answer', id: 1, segments: onlyImage });
    const r2 = svc.saveContent({ type: 'answer', id: 2, segments: [] });
    const r3 = svc.saveContent({ type: 'answer', id: 3 });

    for (const r of [r1, r2, r3]) {
        assert.equal(r.ok, false);
        assert.equal(r.reason, 'empty');
    }
    assert.equal(localStorage.getItem(INDEX), null, '空存档不该建索引');
    assert.equal(localStorage.getItem(contentKey('answer', 1)), null);
});

test('saveContent：写入抛错按空间不足报告，索引不留半条记录', () => {
    const real = localStorage.setItem;
    localStorage.setItem = () => { throw new Error('QuotaExceeded'); };
    const r = svc.saveContent({ type: 'answer', id: 8, title: 'T', segments: segs() });
    localStorage.setItem = real;

    assert.equal(r.ok, false);
    assert.equal(r.reason, 'quota');
    assert.equal(localStorage.getItem(INDEX), null);
});

test('getSaved：脏数据按不存在处理', () => {
    assert.equal(svc.getSaved('answer', 404), null, '没存过回 null');

    localStorage.setItem(contentKey('answer', 5), 'not json');
    assert.equal(svc.getSaved('answer', 5), null);

    localStorage.setItem(contentKey('answer', 6), JSON.stringify({ type: 'answer', id: '6' }));
    assert.equal(svc.getSaved('answer', 6), null, 'segments 不是数组等于渲染不出来，按不存在处理');
});

test('listSaved：索引缺失或损坏都回空数组', () => {
    assert.deepEqual(svc.listSaved(), []);
    localStorage.setItem(INDEX, '{"note":"曾经是个对象"}');
    assert.deepEqual(svc.listSaved(), [], '索引被写坏时列表页要能照常打开');
});

test('removeSaved：索引与正文键一起摘掉，其余条目不动', () => {
    svc.saveContent({ type: 'answer', id: 1, title: '一', segments: segs() });
    svc.saveContent({ type: 'article', id: 1, title: '二', segments: segs() });

    const rest = svc.removeSaved('answer', 1);

    assert.deepEqual(rest.map((e) => e.title), ['二']);
    assert.equal(svc.getSaved('answer', 1), null);
    assert.ok(svc.getSaved('article', 1), '同 id 不同类型是两条存档');
    assert.equal(rest.length, svc.listSaved().length);
});

test('clearSaved：按前缀清正文键，别的键不受影响', () => {
    localStorage.setItem('zhihu_tip_1', '提示版本号');
    localStorage.setItem(contentKey('answer', 1), '{}');
    localStorage.setItem(contentKey('article', 2), '{}');
    localStorage.setItem(INDEX, '[{"type":"answer","id":"1"}]');

    svc.clearSaved();

    assert.deepEqual(svc.listSaved(), []);
    assert.equal(localStorage.getItem(contentKey('answer', 1)), null);
    assert.equal(localStorage.getItem(contentKey('article', 2)), null);
    assert.equal(localStorage.getItem('zhihu_tip_1'), '提示版本号', '清存档不能连别的功能的键一起清');
});

test('clearSaved：键名枚举不可用时仍能按索引清掉正文', () => {
    svc.saveContent({ type: 'answer', id: 99, title: 'T', segments: segs() });
    const realKey = localStorage.key;
    localStorage.key = () => null;

    try {
        svc.clearSaved();
        assert.equal(localStorage.getItem(contentKey('answer', 99)), null, '索引记着的条目不靠枚举也能删干净');
        assert.deepEqual(svc.listSaved(), []);
    } finally {
        localStorage.key = realKey;
    }
});
