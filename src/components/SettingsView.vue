<script setup>
import MaterialSymbol from './MaterialSymbol.vue';
</script>

<template>
    <div class="settings-view">
        <div class="container">
            <s-scroll-view class="scroller">
                <h1 class="page-title">设置</h1>

                <div class="settings-group">
                    <div class="settings-item border-bottom">
                        <div class="item-content">
                            <span class="item-title">深色模式</span>
                            <span class="item-subtitle">跟随系统自动切换</span>
                        </div>
                        <s-button type="text">自动</s-button>
                    </div>
                    <div class="settings-item">
                        <div class="item-content">
                            <span class="item-title">字号大小</span>
                            <span class="item-subtitle">标准</span>
                        </div>
                        <MaterialSymbol icon="chevron_right" class="icon-end" />
                    </div>
                </div>

                <div class="settings-group">
                    <div class="settings-item">
                        <div class="item-content">
                            <span class="item-title">隐私政策</span>
                        </div>
                        <MaterialSymbol icon="open_in_new" :size="18" class="icon-end" />
                    </div>
                    <div class="settings-item">
                        <div class="item-content">
                            <span class="item-title">关于</span>
                            <span class="item-subtitle">版本 1.0.0 (Beta)</span>
                        </div>
                    </div>
                </div>
            </s-scroll-view>
        </div>
    </div>
</template>

<style scoped>
.settings-view {
    height: 100%;
    width: 100%;
}

.container {
    max-width: 600px;
    margin: auto;
    height: 100%;
    padding: 16px;
}

.scroller {
    height: 100%;
    width: 100%;
}

.page-title {
    font-size: 1.875rem;
    font-weight: bold;
    margin: 16px 0 32px;
}

.settings-group {
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 24px;
}

.settings-item {
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
}

.item-content {
    display: flex;
    flex-direction: column;
}

.item-title {
    font-weight: 500;
}

.item-subtitle {
    font-size: 0.75rem;
    margin-top: 2px;
}
</style>
