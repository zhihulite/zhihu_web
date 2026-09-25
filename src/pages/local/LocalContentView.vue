<script setup>
import { ref, computed } from 'vue';
import { f7 } from 'framework7-vue';
import ContentRenderer from '@/components/ContentRenderer.vue';
import EmptyState from '@/components/EmptyState.vue';
import { getSaved, removeSaved } from '@/services/local-save.js';

const props = defineProps({
    f7route: Object,
    f7router: Object,
});

const type = props.f7route?.params?.type;
const id = props.f7route?.params?.id;

const record = ref(getSaved(type, id));
const found = computed(() => !!record.value);
const savedTime = computed(() => {
    if (!record.value?.savedAt) return '';
    const d = new Date(record.value.savedAt);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
});

const goBack = () => props.f7router.back();

const removeThis = () => {
    f7.dialog.confirm('删除这条本地存档？', '删除', () => {
        removeSaved(type, id);
        props.f7router.navigate('/local/', { reloadCurrent: true });
    });
};
</script>

<template>
    <f7-page class="local-content-view">
        <f7-navbar title="本地存档" back-link="返回">
            <f7-nav-right>
                <f7-link v-if="found" icon-f7="trash" @click="removeThis" />
            </f7-nav-right>
        </f7-navbar>

        <f7-page-content v-if="found" class="padding-bottom">
            <div class="local-meta">
                <div class="local-title">{{ record.title }}</div>
                <div class="local-author">{{ record.authorName }}</div>
                <!-- 存档只收文字分段，配图整段不入档，这里把差异讲明白 -->
                <div class="local-hint">
                    本地存档 · {{ savedTime }} · 共 {{ record.segments.length }} 段<template
                        v-if="record.droppedImages">，{{ record.droppedImages }} 张配图未保存</template>
                </div>
            </div>
            <ContentRenderer :segments="record.segments" />
        </f7-page-content>

        <EmptyState v-else icon="archivebox" text="本地存档已不存在" subtext="可能已被删除，返回上一页重新保存" />
        <f7-link v-if="!found" class="back-link" @click="goBack">返回</f7-link>
    </f7-page>
</template>

<style scoped>
.local-meta {
    padding: 16px;
    border-bottom: 1px solid var(--app-divider-color);
}

.local-title {
    font-size: 20px;
    font-weight: 700;
    line-height: 1.4;
    color: var(--f7-text-color);
}

.local-author {
    margin-top: 6px;
    font-size: 14px;
    color: var(--f7-text-color);
}

.local-hint {
    margin-top: 8px;
    font-size: 12px;
    color: var(--app-sub-text);
}

.back-link {
    display: block;
    text-align: center;
    margin: 16px;
}
</style>
