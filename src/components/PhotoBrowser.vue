<script setup>
// 图片查看器：包装 f7-photo-browser，通过 ref 暴露 open(urls, index) 供各页调用。
// 工具条补「保存 / 分享」；查看器 DOM 由 F7 动态渲染，按钮点击走 document 委托并按打开状态归属实例。
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { f7 } from 'framework7-vue';
import { openLink } from '@/core/navigation.js';
import { downloadBlob, shareFile } from '@/utils/share.js';

const photos = ref([]);
const browserRef = ref(null);
const opened = ref(false);

const renderToolbar = () => `
    <div class="toolbar toolbar-bottom tabbar">
        <div class="toolbar-inner">
            <a class="link photo-browser-prev">上一张</a>
            <a class="link" data-photo-tool="save">保存</a>
            <a class="link" data-photo-tool="share">分享</a>
            <a class="link photo-browser-next">下一张</a>
        </div>
    </div>`;

// 按激活幻灯片的原始下标回取本实例的图：取不到就不动，避免多实例时替别人的图集响应
const activeUrl = () => {
    const slide = document.querySelector('.photo-browser-standalone .swiper-slide-active');
    const index = Number(slide?.getAttribute('data-swiper-slide-index'));
    if (!Number.isInteger(index)) return '';
    return photos.value[index]?.url || '';
};

const fileNameOf = (url) => {
    const base = url.split('/').pop().split('?')[0].split('#')[0];
    return decodeURIComponent(base) || 'zhihu-image.jpg';
};

const fetchBlob = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`图片读取失败 ${res.status}`);
    return res.blob();
};

const saveActive = async () => {
    const url = activeUrl();
    if (!url) return;
    try {
        downloadBlob(await fetchBlob(url), fileNameOf(url));
        f7.toast.show({ text: '图片已保存', closeTimeout: 2000 });
    } catch (e) {
        // 跨域拿不到字节流时退回新标签打开，长按即可存图
        openLink(url);
        f7.toast.show({ text: '已在新标签打开，长按图片可保存', closeTimeout: 2500 });
    }
};

const shareActive = async () => {
    const url = activeUrl();
    if (!url) return;
    try {
        const blob = await fetchBlob(url);
        const type = blob.type || 'image/jpeg';
        const file = new File([blob], fileNameOf(url), { type });
        const result = await shareFile(file);
        if (result === 'unsupported') f7.toast.show({ text: '当前浏览器不支持图片分享' });
    } catch (e) {
        f7.toast.show({ text: '图片读取失败，无法分享' });
    }
};

const onToolClick = (e) => {
    if (!opened.value) return;
    const link = e.target.closest?.('[data-photo-tool]');
    if (!link) return;
    e.preventDefault();
    if (link.dataset.photoTool === 'save') saveActive();
    else shareActive();
};

const open = (urls, index = 0) => {
    photos.value = (urls || []).map((u) => ({ url: typeof u === 'string' ? u : u.url, caption: '' }));
    opened.value = true;
    // 等 photos 写入后再 open，避免首次打开拿到空列表
    requestAnimationFrame(() => browserRef.value?.open(index));
};

onMounted(() => document.addEventListener('click', onToolClick));
onBeforeUnmount(() => document.removeEventListener('click', onToolClick));

defineExpose({ open });
</script>

<template>
    <f7-photo-browser ref="browserRef" :photos="photos" theme="dark" navbar-of-text="/"
        :render-toolbar="renderToolbar" @photobrowser:close="opened = false"
        @photobrowser:closed="opened = false" />
</template>
