<script setup>

</script>

<template>
    <f7-page name="settings">
        <f7-navbar title="设置" back-link="返回"></f7-navbar>

        <f7-block-title>外观</f7-block-title>
        <f7-list strong inset>
            <f7-list-item title="深色模式" after="自动" link="#"></f7-list-item>
            <f7-list-item title="字号大小" after="标准" link="#"></f7-list-item>
        </f7-list>

        <f7-block-title>关于</f7-block-title>
        <f7-list strong inset>
            <f7-list-item title="隐私政策" link="#" external target="_blank">
                <template #after>
                    <f7-icon ios="f7:arrow_up_right_square" md="material:open_in_new" size="18" />
                </template>
            </f7-list-item>
            <f7-list-item title="关于" after="版本 1.0.0 (Beta)"></f7-list-item>
        </f7-list>
    </f7-page>
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
