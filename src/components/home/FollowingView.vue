<script setup>
import { ref } from 'vue';
import MobileTabLayout from '../MobileTabLayout.vue';
import QuestionsContent from './QuestionsContent.vue';
import CollectionsListContent from './CollectionsListContent.vue';
import { HOT_DATA } from '../../services/mockData';
import { useRouter } from 'vue-router';

const sidebarFollowingTab = ref('questions');
const router = useRouter();

const handleArticleClick = (item) => {
    if (item.type === 'answer' && item.questionId) {
        router.push(`/question/${item.questionId}`);
    } else {
        router.push(`/article/${item.id}`);
    }
};

const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
};
</script>

<template>
    <div class="following-view">
        <div class="container">
            <h1 class="page-title">我的关注</h1>
            <div class="content-wrapper">
                <MobileTabLayout :tabs="[
                    { id: 'questions', label: '关注的问题' },
                    { id: 'collections', label: '关注的收藏' }
                ]" :activeId="sidebarFollowingTab" :onChange="(id) => sidebarFollowingTab = id">
                    <template #questions>
                        <QuestionsContent :data="HOT_DATA" :onArticleClick="handleArticleClick"
                            :onRefresh="handleRefresh" />
                    </template>
                    <template #collections>
                        <CollectionsListContent :onRefresh="handleRefresh" />
                    </template>
                </MobileTabLayout>
            </div>
        </div>
    </div>
</template>

<style scoped>
.following-view {
    height: 100%;
    width: 100%;
    background-color: var(--md-sys-color-surface);
}

.container {
    max-width: 900px;
    margin: auto;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.page-title {
    font-size: 1.875rem;
    font-weight: bold;
    color: var(--md-sys-color-on-surface);
    margin: 0;
    padding: 16px 24px 8px;
    flex-shrink: 0;
}

.content-wrapper {
    flex: 1;
    overflow: hidden;
}
</style>
