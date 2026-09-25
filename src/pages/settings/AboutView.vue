<script setup>
import { ref, computed, onMounted } from 'vue';
import { checkUpdate, getVersionInfo } from '@/services/update.js';

const info = ref(null);
onMounted(async () => {
    try {
        info.value = await getVersionInfo();
    } catch (e) {
        // 开发版没有 version.json，只留名称
    }
});

const version = computed(() => info.value?.version || '开发版');
const builtAt = computed(() =>
    info.value?.builtAt ? new Date(info.value.builtAt).toLocaleString('zh-CN') : '');
</script>

<template>
    <f7-page name="settings-about">
        <f7-navbar title="关于" back-link="返回"></f7-navbar>

        <f7-block strong inset class="about-header">
            <p class="about-name">Zyphron</p>
            <p class="text-color-gray font-size-13">版本 {{ version }}</p>
            <p class="text-color-gray font-size-13" v-if="builtAt">构造日期 {{ builtAt }}</p>
        </f7-block>

        <f7-block-title>关于软件</f7-block-title>
        <f7-list strong inset media-list>
            <f7-list-item title="当前版本" subtitle="点击检查一次新版本" :after="version" link="#"
                @click="checkUpdate({ silent: false })"></f7-list-item>
        </f7-list>

        <f7-block-title>更多内容</f7-block-title>
        <f7-list strong inset media-list>
            <f7-list-item title="项目主页" subtitle="更新说明与下载" link="#"
                @click="$openLink('https://zhihulite.github.io/')"></f7-list-item>
            <f7-list-item title="开源仓库" subtitle="欢迎提 issue 与 PR" link="#"
                @click="$openLink('https://github.com/zhihulite/zhihu_web')"></f7-list-item>
        </f7-list>
    </f7-page>
</template>

<style scoped>
.about-header {
    text-align: center;
    padding-top: 20px;
    padding-bottom: 20px;
}

.about-name {
    font-size: 20px;
    font-weight: 600;
}
</style>
