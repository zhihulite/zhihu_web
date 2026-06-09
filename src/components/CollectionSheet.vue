<script setup>
import { ref, watch, reactive } from 'vue';
import { f7 } from 'framework7-vue';
import $http from '../api/http.js';

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
const lastResult = ref(null);

const showCreatePopup = ref(false);
const createData = reactive({
    title: '',
    isPublic: true,
    isSubmitting: false
});

const fetchCollections = async () => {
    if (isLoading.value) return;
    isLoading.value = true;

    try {
        let res;
        if (!lastResult.value) {
            const url = `https://api.zhihu.com/collections/contents/${props.contentType}/${props.contentId}?limit=20`;
            res = await $http.get(url);
        } else {
            res = await lastResult.value.next();
        }
        
        const rawList = res.data || [];

        lastResult.value = res;
        const formatted = rawList.map(item => ({
            id: item.id,
            title: item.title,
            selected: !!item.is_favorited,
            originalSelected: !!item.is_favorited
        }));

        collections.value.push(...formatted);

        if (!res.paging?.is_end) {
            await fetchCollections();
        }
    } catch (e) {
        console.error('Failed to fetch collections:', e);
    } finally {
        isLoading.value = false;
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
    } finally {
        isSaving.value = false;
    }
};

const createNewCollection = () => {
    createData.title = '';
    createData.isPublic = true;
    showCreatePopup.value = true;
};

const doCreate = async () => {
    if (!createData.title.trim()) {
        f7.dialog.alert('请输入标题');
        return;
    }
    createData.isSubmitting = true;
    try {
        const url = 'https://api.zhihu.com/collections';
        const params = new URLSearchParams();
        params.append('title', createData.title);
        params.append('description', '');
        params.append('is_public', String(createData.isPublic));
        params.append('is_default', 'false');

        const result = await $http.post(url, params.toString(), { encryptBody: false, encryptHead: true });

        if (result && result.id) {
            f7.toast.show({ text: '创建成功' });
            collections.value.unshift({
                id: String(result.id),
                title: createData.title,
                selected: true,
                originalSelected: false
            });
            showCreatePopup.value = false;
        }
    } catch (e) {
        console.error('Failed to create collection:', e);
    } finally {
        createData.isSubmitting = false;
    }
}

watch(() => props.modelValue, (newVal) => {
    if (newVal) {
        collections.value = [];
        lastResult.value = null;
        fetchCollections();
    }
});

const handleClose = () => {
    emit('update:modelValue', false);
};
</script>

<template>
    <f7-sheet class="collection-sheet" :opened="modelValue" @sheet:closed="handleClose"
        style="height: 70vh; border-radius: 24px 24px 0 0;" swipe-to-close backdrop>
        <div class="sheet-modal-inner" style="height: 100%; display: flex; flex-direction: column;">
            <div class="header">
                <span class="title">选择收藏夹</span>
                <div class="right">
                    <f7-link @click="createNewCollection">新建收藏夹</f7-link>
                    <f7-link icon-only @click="handleClose" class="margin-left">
                        <f7-icon ios="f7:multiply" md="material:close" />
                    </f7-link>
                </div>
            </div>

            <div class="page-content" style="flex: 1; overflow-y: auto;">
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
                <f7-button fill large class="confirm-btn" @click="handleConfirm" :loading="isSaving">
                    确认选择
                </f7-button>
            </div>
        </div>
    </f7-sheet>

    <f7-sheet class="create-collection-sheet" :opened="showCreatePopup" @sheet:closed="showCreatePopup = false"
        style="height: auto; border-radius: 24px 24px 0 0;" swipe-to-close backdrop>
        <div class="sheet-modal-inner">
            <div class="header">
                <span class="title">新建收藏夹</span>
                <f7-link @click="showCreatePopup = false">取消</f7-link>
            </div>
            <div class="sheet-content padding-bottom">
                <f7-list no-hairlines-md>
                    <f7-list-input label="标题" type="text" placeholder="收藏夹名称" clear-button
                        v-model:value="createData.title" />
                    <f7-list-item title="公开收藏夹" footer="公开收藏夹可以让其他人看到你收藏的内容">
                        <template #after>
                            <f7-toggle v-model:checked="createData.isPublic" />
                        </template>
                    </f7-list-item>
                </f7-list>
                <div class="padding">
                    <f7-button fill large class="confirm-btn" @click="doCreate" :loading="createData.isSubmitting">
                        提交
                    </f7-button>
                </div>
            </div>
        </div>
    </f7-sheet>
</template>

<style scoped>
.collection-sheet,
.create-collection-sheet {
    max-width: 600px;
    left: 0 !important;
    right: 0 !important;
    margin: 0 auto !important;
    width: 100%;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.title {
    font-size: 1.1em;
    font-weight: bold;
}

.header .right {
    display: flex;
    align-items: center;
}

.confirm-btn {
    width: 100%;
    margin: 0 auto;
    border-radius: 12px;
}
</style>
