<script setup>
import { defineProps, defineEmits } from 'vue';

/* 当 nested=true 时，toolbar 顶到最顶部 */
/* 当 autoPageContent=false 时（即不自动添加 page-content） 下层自己提供的 page-content 需要取消 padding-top */
const props = defineProps({
    tabs: {
        type: Array, // Array { id, label, icon?: string | { ios, md } }
        required: true
    },
    initialActiveId: {
        type: String,
        default: undefined
    },
    onChange: {
        type: Function,
        default: undefined
    },
    scrollable: {
        type: Boolean,
        default: false
    },
    nested: {
        type: Boolean,
        default: false
    },
    autoPageContent: {
        type: Boolean,
        default: true
    },
    fixed: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['update:activeId', 'tab:show', 'tabviewinfinite']);

const onTabShow = (tab) => {
    if (props.onChange) {
        props.onChange(tab.id);
    }
    emit('update:activeId', tab.id);
    emit('tab:show', tab.id);
};

const instanceId = Math.random().toString(36).slice(2, 10);
const getTabId = (id) => `mtl-${instanceId}-${id}`

</script>


<template>
    <div class="tab-layout" :class="{ 'nested': nested }">

        <!-- top为0防止嵌套tabbar存在额外的top -->
        <f7-toolbar tabbar top :scrollable="scrollable" class="tab-bar" :class="{ 'tab-bar-static': !fixed }">
            <f7-link v-for="(tab, index) in tabs" :key="tab.id" :tab-link="`#${getTabId(tab.id)}`"
                @click="onTabShow(tab)" :tab-link-active="initialActiveId ? tab.id === initialActiveId : index === 0">
                <f7-icon v-if="tab.icon" :icon="typeof tab.icon === 'string' ? tab.icon : undefined"
                    :ios="typeof tab.icon === 'object' ? tab.icon.ios : undefined"
                    :md="typeof tab.icon === 'object' ? tab.icon.md : undefined"
                    :material="typeof tab.icon === 'string' && !tab.icon.includes(':') ? tab.icon : undefined">
                </f7-icon>
                <span class="tab-label">{{ tab.label }}</span>
            </f7-link>
        </f7-toolbar>

        <f7-tabs swipeable :class="{ 'tabs-auto-page-content': !autoPageContent }">
            <f7-tab v-for="(tab, index) in tabs" :key="tab.id" :id="getTabId(tab.id)" @tab:show="onTabShow(tab)"
                :tab-active="initialActiveId ? tab.id === initialActiveId : index === 0">
                <slot :name="tab.id"></slot>
            </f7-tab>
        </f7-tabs>
    </div>
</template>

<style scoped>
.tab-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    position: relative;
}

:deep(.tabs) {
    width: 100%;
    flex: 1;
    overflow: visible;
}

:deep(.tab) {
    width: 100%;
    overflow: visible;
}

.tab-bar {
    z-index: 10;
}
</style>
