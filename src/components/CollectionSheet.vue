<script setup>
import { ref, watch } from 'vue';
import { f7 } from 'framework7-vue';
import $http from '@/services/http.js';
import CollectionEditSheet from '@/components/CollectionEditSheet.vue';

const props = defineProps({
    modelValue: Boolean,
    contentType: {
        type: String,
        required: true
    },
    contentId: {
        type: [String, Number],
        required: true
    }
});

const emit = defineEmits(['update:modelValue', 'success']);

const collections = ref([]);
const isLoading = ref(false);
const isSaving = ref(false);

const showEditSheet = ref(false);

// 每次打开算一个世代：换了内容就作废上一轮的分页循环，
    // 否则旧列表会接着往清空后的数组里灌，确认时把上一个对象的收藏夹套到新对象上
let fetchToken = 0;

const fetchCollections = async () => {
    const token = ++fetchToken;
    isLoading.value = true;

    try {
        let res = await $http.get(
            `https://api.zhihu.com/collections/contents/${props.contentType}/${props.contentId}?limit=20`);
        while (res && token === fetchToken) {
            (res.data || []).forEach((item) => collections.value.push({
                id: item.id,
                title: item.title,
                selected: !!item.is_favorited,
                originalSelected: !!item.is_favorited,
            }));
            if (res.paging?.is_end) break;
            res = await res.next();
        }
    } catch (e) {
        console.error('Failed to fetch collections:', e);
        f7.toast.show({ text: e.message || '收藏夹列表加载失败', position: 'center' });
    } finally {
        if (token === fetchToken) isLoading.value = false;
    }
};

const handleConfirm = async () => {
    if (isSaving.value) return;

    const addIds = collections.value
        .filter(c => c.selected && !c.originalSelected)
        .map(c => c.id);

    const removeIds = collections.value
        .filter(c => !c.selected && c.originalSelected)
        .map(c => c.id);

    if (addIds.length === 0 && removeIds.length === 0) {
        emit('update:modelValue', false);
        return;
    }

    isSaving.value = true;
    try {
        const url = `https://api.zhihu.com/collections/contents/${props.contentType}/${props.contentId}`;
        const params = new URLSearchParams();
        if (addIds.length > 0) params.append('add_collections', addIds.join(','));
        if (removeIds.length > 0) params.append('remove_collections', removeIds.join(','));

        await $http.put(url, params.toString(), { encryptBody: false, encryptHead: true });

        f7.toast.show({
            text: addIds.length > 0 ? "收藏成功" : "取消收藏成功",
            position: 'center'
        });
        const isFavorited = collections.value.some(c => c.selected);
        emit('success', isFavorited);
        emit('update:modelValue', false);
    } catch (e) {
        console.error('Failed to update collections:', e);
        f7.toast.show({ text: e.message || '收藏失败', position: 'center' });
    } finally {
        isSaving.value = false;
    }
};

const createNewCollection = () => {
    showEditSheet.value = true;
};

// 新建成功后置顶并勾选，等待用户确认统一提交
const onCreated = ({ id, title }) => {
    if (!id) return;
    collections.value.unshift({ id, title, selected: true, originalSelected: false });
};

watch(() => props.modelValue, (newVal) => {
    if (newVal) {
        collections.value = [];
        fetchCollections();
    }
});

const handleClose = () => {
    emit('update:modelValue', false);
};
</script>

<template>
    <f7-sheet class="sheet-bottom" :opened="modelValue" @sheet:closed="handleClose"
        style="height: 70vh;" swipe-to-close backdrop>
        <div class="sheet-modal-inner">
            <div class="sheet-header">
                <span class="title">选择收藏夹</span>
                <div class="sheet-header-actions">
                    <f7-link @click="createNewCollection">新建收藏夹</f7-link>
                    <f7-link icon-only @click="handleClose" class="margin-left">
                        <f7-icon ios="f7:multiply" md="material:close" />
                    </f7-link>
                </div>
            </div>

            <div class="page-content sheet-scroll-body">
                <div v-if="isLoading && collections.length === 0" class="padding text-align-center">
                    <f7-preloader /> 正在加载...
                </div>
                <f7-list v-else no-hairlines-md>
                    <f7-list-item v-for="c in collections" :key="c.id" :title="c.title" checkbox :checked="c.selected"
                        @change="(e) => c.selected = e.target.checked">
                    </f7-list-item>
                </f7-list>
            </div>

            <div class="footer padding" style="display: block;">
                <f7-button fill large class="sheet-primary-btn" @click="handleConfirm" :loading="isSaving">
                    确认选择
                </f7-button>
            </div>
        </div>
    </f7-sheet>

    <CollectionEditSheet v-model="showEditSheet" @saved="onCreated" />
</template>
