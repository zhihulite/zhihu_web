<script setup>
import { ref, reactive, onMounted, h } from 'vue';
import { f7 } from 'framework7-vue';
import { HistoryService } from '../../services/historyService.js';

const dailyList = ref([]);
const loading = ref(false);
const hasMore = ref(true);
const currentDate = ref(null); // Format: yyyyMMdd

const fetchDailyData = async (isRefresh = false) => {
    if (loading.value) return;
    loading.value = true;

    try {
        let url = 'https://news-at.zhihu.com/api/4/stories/latest';

        if (!isRefresh && currentDate.value) {
            url = `https://news-at.zhihu.com/api/4/stories/before/${currentDate.value}`;
        }

        // 调用全局的 unifiedFetch 实例
        const res = await window.unifiedFetch.get(url);
        const mappedStories = (res.stories || []).map(s => ({
            id: s.id,
            title: s.title,
            hint: s.hint,
            image: s.images ? s.images[0] : null,
            url: s.url
        }));

        if (isRefresh) {
            dailyList.value = mappedStories;
        } else {
            dailyList.value.push(...mappedStories);
        }

        // 日报不需要记录历史记录

        currentDate.value = res.date;
        hasMore.value = mappedStories.length > 0;

    } catch (e) {
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

const handleStoryClick = (item) => {
    if (item.url) {
        HistoryService.addRecord({
            id: item.id,
            type: 'article',
            title: item.title,
            preview: item.hint
        });
        $openLink(item.url);
    }
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

            <div v-if="dailyList.length === 0 && !loading" class="empty-state">
                <f7-icon f7="news" size="48" color="gray" />
                <p>暂无内容</p>
            </div>
        </div>
    </f7-page>
</template>

<style scoped>
.daily-container {
    max-width: 800px;
    min-height: 100%;
    margin: 0 auto;
}

.date-header {
    padding: 16px 16px 8px;
    font-size: 14px;
    font-weight: 600;
    color: #8e8e93;
    text-transform: uppercase;
    letter-spacing: 0.5px;
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
    color: #1a1a1a;
}

.story-hint {
    font-size: 13px;
    color: #8e8e93;
}

.card-image {
    width: 80px;
    height: 80px;
    flex-shrink: 0;
    border-radius: 8px;
    overflow: hidden;
    background: #f0f0f0;
}

.card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.empty-state {
    padding: 100px 32px;
    text-align: center;
    color: #999;
}
</style>
