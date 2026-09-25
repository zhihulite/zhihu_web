<script setup>
defineProps({
    height: { type: String, default: '100%' },
});
</script>

<template>
    <div class="page-loader display-flex justify-content-center align-items-center" :style="{ height }">
        <f7-preloader />
    </div>
</template>
