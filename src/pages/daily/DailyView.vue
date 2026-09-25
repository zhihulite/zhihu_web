<script setup>
import { ref, onMounted } from 'vue';
import { openLink } from '@/core/navigation.js';
import { rawHttp } from '@/services/http.js';
import { useAlive } from '@/composables/useAlive.js';
import EmptyState from '@/components/EmptyState.vue';

const dailyList = ref([]);
const loading = ref(false);
const hasMore = ref(true);
const currentDate = ref(null); // Format: yyyyMMdd
const { isAlive, acquireSignal } = useAlive();

const pad2 = (n) => String(n).padStart(2, '0');

const ymdOf = (d) => `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`;

// 翻页游标按「前一天」本地推进：stories/before 是否回传 date 不可靠，接口缺字段时
// 依赖它会反复拉同一批内容
const dayBefore = (ymd) => {
    const d = new Date(+ymd.slice(0, 4), +ymd.slice(4, 6) - 1, +ymd.slice(6, 8));
    d.setDate(d.getDate() - 1);
    return ymdOf(d);
};

const fetchDailyData = async (isRefresh = false) => {
    if (loading.value) return;
    loading.value = true;

    try {
        // 游标未建立时（首屏或首屏失败后的续拉）都从 latest 重建，避免重复 push 同一批
        const replace = isRefresh || !currentDate.value;
        let url = 'https://news-at.zhihu.com/api/4/stories/latest';
        let nextDate = null;
        if (!replace) {
            nextDate = dayBefore(currentDate.value);
            url = `https://news-at.zhihu.com/api/4/stories/before/${nextDate}`;
        }

        const res = await rawHttp.get(url, {
            headers: { 'Cookie': ' ' },
            signal: acquireSignal(),
        });
        if (!isAlive()) return;
        const mappedStories = (res.stories || []).map(s => ({
            id: s.id,
            title: s.title,
            hint: s.hint,
            image: s.images ? s.images[0] : null,
            url: s.url || `https://daily.zhihu.com/story/${s.id}`
        }));

        if (replace) {
            dailyList.value = mappedStories;
            currentDate.value = ymdOf(new Date());
        } else {
            dailyList.value.push(...mappedStories);
            if (nextDate) currentDate.value = nextDate;
        }

        hasMore.value = mappedStories.length > 0;

    } catch (e) {
        if (e?.name === 'AbortError') return;
        console.error("Failed to fetch zhihu daily", e);
    } finally {
        loading.value = false;
    }
};

const onRefresh = async (done) => {
    await fetchDailyData(true);
    if (done) done();
};

const onInfinite = () => {
    if (hasMore.value && !loading.value) {
        fetchDailyData(false);
    }
};

// 日报正文是站外链接：写历史会被按 article 类型回跳站内详情，点开是错内容，故不记
const handleStoryClick = (item) => {
    if (item.url) openLink(item.url);
};

onMounted(() => {
    fetchDailyData(true);
});
</script>

<template>
    <f7-page class="daily-view" ptr @ptr:refresh="onRefresh" infinite @infinite="onInfinite">
        <f7-navbar title="知乎日报" back-link="返回" />

        <div class="daily-container">
            <div class="card-grid">
                <f7-card v-for="(item, index) in dailyList" :key="item.id + '-' + index" class="daily-card"
                    @click="handleStoryClick(item)">
                    <div class="card-content-wrapper">
                        <div class="card-text">
                            <h3 class="story-title">{{ item.title }}</h3>
                            <div class="story-hint">{{ item.hint }}</div>
                        </div>
                        <div v-if="item.image" class="card-image">
                            <img :src="item.image" loading="lazy" />
                        </div>
                    </div>
                </f7-card>
            </div>

            <EmptyState v-if="dailyList.length === 0 && !loading" icon="doc_plaintext" text="暂无内容" />
        </div>
    </f7-page>
</template>

<style scoped>
.daily-container {
    max-width: 800px;
    min-height: 100%;
    margin: 0 auto;
}

.card-grid {
    padding: 8px 0;
}

.daily-card {
    margin: 12px 16px !important;
    border-radius: 12px !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
    border: none !important;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s;
}

.card-content-wrapper {
    display: flex;
    padding: 16px;
    gap: 16px;
    align-items: flex-start;
}

.card-text {
    flex: 1;
    min-width: 0;
}

.story-title {
    margin: 0 0 8px 0;
    font-size: 17px;
    font-weight: 700;
    line-height: 1.4;
    color: var(--f7-text-color);
}

.story-hint {
    font-size: 13px;
    color: var(--app-sub-text);
}

.card-image {
    width: 80px;
    height: 80px;
    flex-shrink: 0;
    border-radius: 8px;
    overflow: hidden;
    background: var(--app-placeholder-bg);
}

.card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

</style>
