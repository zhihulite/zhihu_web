<script setup>
import { f7 } from 'framework7-vue';
const props = defineProps({ f7router: Object });
const goHome = () => {
  const router = props.f7router || f7.views?.main?.router;
  if (router) router.navigate('/', { clearPreviousHistory: false });
};
</script>

<template>
  <f7-page name="not-found">
    <f7-navbar title="页面不存在" back-link="返回"></f7-navbar>
    <f7-block strong inset class="text-align-center">
      <div style="font-size: 48px; line-height: 1; margin-bottom: 16px;">404</div>
      <div style="color: #666; margin-bottom: 24px;">未找到您请求的页面</div>
      <f7-button fill @click="goHome">返回首页</f7-button>
    </f7-block>
  </f7-page>
  </template>
