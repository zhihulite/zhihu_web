<script setup>
import { ref } from 'vue';


defineProps(['f7router']);

const activeTab = ref('mine');

const myCollections = [1, 2];
const followingCollections = [1, 2];
</script>

<template>
    <f7-page class="collections-view">
        <f7-navbar title="收藏">
            <f7-nav-left>
                <f7-link icon-only @click="f7router.back()">
                    <f7-icon ios="f7:arrow_left" md="material:arrow_back" />
                </f7-link>
            </f7-nav-left>
        </f7-navbar>

        <f7-toolbar tabbar top>
            <f7-link tab-link="#tab-mine" tab-link-active>我创建的</f7-link>
            <f7-link tab-link="#tab-following">我关注的</f7-link>
        </f7-toolbar>

        <f7-tabs animated>
            <f7-tab id="tab-mine" class="page-content" tab-active>
                <div class="grid-layout padding">
                    <f7-card class="create-card display-flex justify-content-center align-items-center"
                        style="height: 120px; background: var(--f7-theme-color-tint); color: var(--f7-theme-color);">
                        <div class="text-align-center">
                            <f7-icon ios="f7:plus" md="material:add" size="32" />
                            <div class="font-weight-bold margin-top-half">新建收藏夹</div>
                        </div>
                    </f7-card>

                    <f7-card v-for="i in myCollections" :key="i" class="collection-card no-margin">
                        <div
                            :style="`height: 120px; background-image: url(https://picsum.photos/id/${100 + i}/400/300); background-size: cover; position: relative`">
                            <div class="overlay"
                                style="position: absolute; bottom: 0; left: 0; right: 0; padding: 8px; background: rgba(0,0,0,0.5); color: white;">
                                <div class="font-weight-bold">深度学习 {{ i }}</div>
                                <div class="text-size-12 opacity-80">24 条内容</div>
                            </div>
                        </div>
                    </f7-card>
                </div>
            </f7-tab>

            <f7-tab id="tab-following" class="page-content">
                <f7-list media-list>
                    <f7-list-item v-for="i in followingCollections" :key="i" :title="`优质收藏夹 ${i}`" subtitle="1.2k 关注"
                        link="#">
                        <template #media>
                            <img :src="`https://picsum.photos/id/${200 + i}/200/200`" width="44"
                                style="border-radius: 4px;" />
                        </template>
                        <template #after>
                            <f7-button small outline>已关注</f7-button>
                        </template>
                    </f7-list-item>
                </f7-list>
            </f7-tab>
        </f7-tabs>
    </f7-page>
</template>

<style scoped>
.grid-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}
</style>
