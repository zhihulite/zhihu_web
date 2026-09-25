<script setup>
// src/components/CollectionEditSheet.vue
// 创建 / 编辑收藏夹二合一表单：名称、描述、仅自己可见、设为默认。
import { ref, watch, reactive } from 'vue';
import { f7 } from 'framework7-vue';
import $http from '@/services/http.js';

const props = defineProps({
    modelValue: Boolean,
    // 编辑时传 { id, title, description, isPublic }，为空即新建
    collection: { type: Object, default: null },
});

const emit = defineEmits(['update:modelValue', 'saved']);

const form = reactive({ title: '', description: '', isPrivate: false, isDefault: false });
const isSubmitting = ref(false);
const isEdit = () => !!props.collection?.id;

watch(() => props.modelValue, (open) => {
    if (!open) return;
    form.title = props.collection?.title || '';
    form.description = props.collection?.description || '';
    form.isPrivate = props.collection ? props.collection.isPublic === false : false;
    form.isDefault = false;
});

const close = () => emit('update:modelValue', false);

const save = async () => {
    if (isSubmitting.value) return;
    if (!form.title.trim()) {
        f7.toast.show({ text: '请输入收藏夹名称' });
        return;
    }
    isSubmitting.value = true;
    const body = new URLSearchParams({
        title: form.title.trim(),
        description: form.description,
        is_public: String(!form.isPrivate),
        is_default: String(form.isDefault),
    }).toString();

    try {
        if (isEdit()) {
            await $http.put(`https://api.zhihu.com/collections/${props.collection.id}`, body, { encryptBody: false, encryptHead: true });
            f7.toast.show({ text: '保存成功' });
            emit('saved', { id: String(props.collection.id), title: form.title.trim(), isPublic: !form.isPrivate });
        } else {
            const result = await $http.post('https://api.zhihu.com/collections', body, { encryptBody: false, encryptHead: true });
            const newId = result?.collection?.id ?? result?.id;
            f7.toast.show({ text: '创建成功' });
            emit('saved', { id: newId ? String(newId) : '', title: form.title.trim(), isPublic: !form.isPrivate });
        }
        close();
    } catch (e) {
        console.error('收藏夹保存失败:', e);
        f7.toast.show({ text: isEdit() ? '保存失败' : '创建失败' });
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<template>
    <f7-sheet class="sheet-bottom" :opened="modelValue" @sheet:closed="close"
        style="height: auto;" swipe-to-close backdrop>
        <div class="sheet-modal-inner">
            <div class="sheet-header">
                <span class="title">{{ isEdit() ? '编辑收藏夹' : '新建收藏夹' }}</span>
                <f7-link icon-only @click="close">
                    <f7-icon ios="f7:multiply" md="material:close" />
                </f7-link>
            </div>
            <f7-list no-hairlines-md inset>
                <f7-list-input label="名称" type="text" placeholder="请输入收藏夹名称" clear-button
                    v-model:value="form.title" />
                <f7-list-input label="描述（选填）" type="textarea" placeholder="请输入描述" v-model:value="form.description" />
                <f7-list-item title="仅自己可见" footer="开启后其他人不可以看到该收藏夹">
                    <template #after>
                        <f7-toggle v-model:checked="form.isPrivate" />
                    </template>
                </f7-list-item>
                <f7-list-item title="设为默认收藏夹">
                    <template #after>
                        <f7-toggle v-model:checked="form.isDefault" />
                    </template>
                </f7-list-item>
            </f7-list>
            <div class="padding">
                <f7-button fill large class="sheet-primary-btn" :loading="isSubmitting" @click="save">
                    {{ isEdit() ? '保存' : '创建' }}
                </f7-button>
            </div>
        </div>
    </f7-sheet>
</template>
