<script setup>
import { ref, onMounted, computed } from 'vue';
import $http from '../api/http.js';

const props = defineProps({
  videoId: {
    type: String,
    required: true
  }
});

const videoData = ref(null);
const isLoading = ref(true);
const error = ref(null);

const getVideoSrc = computed(() => {
  if (!videoData.value) return '';
  
  const playlist = videoData.value.playlist_v2 || videoData.value.playlist || {};
  if (playlist.FHD?.play_url) return playlist.FHD.play_url;
  if (playlist.HD?.play_url) return playlist.HD.play_url;
  if (playlist.SD?.play_url) return playlist.SD.play_url;
  if (playlist.LD?.play_url) return playlist.LD.play_url;
  
  return '';
});

// 请求视频数据
const fetchVideoData = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const url = `https://lens.zhihu.com/api/v4/videos/${props.videoId}`;
    const res = await $http.get(url);
    videoData.value = res;
  } catch (e) {
    console.error('Failed to fetch video data:', e);
    error.value = '获取视频数据失败';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchVideoData();
});
</script>

<template>
  <div class="z-video-player">
    <div v-if="isLoading" class="loading">
      <f7-preloader color="primary"></f7-preloader>
      <p>加载中...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>
    
    <div v-else-if="videoData" class="video-container">
      <video
        controls
        :src="getVideoSrc"
        class="video-element"
      >
        您的浏览器不支持HTML5视频
      </video>
    </div>
  </div>
</template>

<style scoped>
.z-video-player {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.loading, .error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.video-container {
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-element {
  width: 100%;
  height: auto;
  display: block;
}

.video-info {
  padding: 16px;
  background: #fff;
}

.video-info h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
}

.video-info p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}
</style>