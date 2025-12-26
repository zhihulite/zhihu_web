<script setup>
defineProps(['isOpen', 'onClose']);
</script>

<template>
    <f7-actions :opened="isOpen" @actions:closed="onClose">
        <f7-actions-group>
            <f7-actions-label>更多菜单</f7-actions-label>
            <f7-actions-button>选项 1</f7-actions-button>
            <f7-actions-button>选项 2</f7-actions-button>
        </f7-actions-group>
        <f7-actions-group>
            <f7-actions-button color="red">取消</f7-actions-button>
        </f7-actions-group>
    </f7-actions>
</template>
