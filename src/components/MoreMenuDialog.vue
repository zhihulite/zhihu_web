<script setup>
defineProps(['isOpen', 'onClose']);
</script>
<template>
    <div v-if="isOpen" class="more-menu">More Menu</div>
</template>
