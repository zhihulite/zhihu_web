<script setup>
import { f7 } from 'framework7-vue';

const props = defineProps({
    modelValue: Boolean,
    f7router: Object
});

const emit = defineEmits(['update:modelValue']);

const close = () => {
    emit('update:modelValue', false);
};

const navigate = (path) => {
    if (props.f7router) {
        props.f7router.navigate(path);
    }
    close();
};

const openExternal = (url) => {
    $openLink(url);
    close();
};
</script>

<template>
    <f7-actions :opened="modelValue" @actions:closed="close">
        <f7-actions-group>
            <f7-actions-label>功能菜单</f7-actions-label>
            <f7-actions-button @click="navigate('/notifications')">
                <template #media>
                    <f7-icon ios="f7:bell" md="material:notifications" size="20" />
                </template>
                通知
            </f7-actions-button>
            <f7-actions-button @click="navigate('/messages')">
                <template #media>
                    <f7-icon ios="f7:chat_bubble" md="material:chat_bubble" size="20" />
                </template>
                私信
            </f7-actions-button>
            <f7-actions-button @click="navigate('/people-list/block_all/self')">
                <template #media>
                    <f7-icon ios="f7:person_badge_minus" md="material:person_off" size="20" />
                </template>
                屏蔽用户管理
            </f7-actions-button>
            <f7-actions-button @click="openExternal('https://www.zhihu.com/appview/roundtable')">
                <template #media>
                    <f7-icon ios="f7:circle_grid_3x3" md="material:grid_view" size="20" />
                </template>
                圆桌
            </f7-actions-button>
            <f7-actions-button @click="openExternal('https://www.zhihu.com/appview/special')">
                <template #media>
                    <f7-icon ios="f7:layers" md="material:layers" size="20" />
                </template>
                专题
            </f7-actions-button>
        </f7-actions-group>
        <f7-actions-group>
            <f7-actions-button color="red" @click="close">取消</f7-actions-button>
        </f7-actions-group>
    </f7-actions>
</template>

<style scoped>
/* Any custom styles for actions */
</style>
