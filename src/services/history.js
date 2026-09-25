// src/services/history.js
// 浏览历史：本地 localStorage 记录 + 登录态下同步上报知乎服务端。
import { ref, watch } from 'vue';
import $http from '@/services/http.js';
import { tokenManager } from '@/services/auth.js';
import { KEYS, getJSON, setJSON } from '@/services/storage.js';

const MAX_HISTORY = 200;

// 本地规范类型 → 服务端 content_type（people 对应 profile）
const SERVER_TYPE = { people: 'profile' };

const historyRecords = ref(loadHistory());

function loadHistory() {
    return getJSON(KEYS.history, []);
}

function saveHistory(records) {
    setJSON(KEYS.history, records);
}

// 登录态下上报服务端，失败静默（本地已记录，不阻塞浏览）
function syncToServer(item) {
    if (tokenManager.isGuest || !tokenManager.getAccessToken()) return;
    const body = JSON.stringify({
        content_token: String(item.id),
        content_type: SERVER_TYPE[item.type] || item.type,
        read_progress: Math.max(0, Math.min(100, item.progress || 0)),
        listen_progress: 0,
        read_time: Math.floor(Date.now() / 1000),
        custom_content_data: null,
    });
    $http.post('https://api.zhihu.com/read_history/add', body).catch(() => { });
}

watch(historyRecords, (newVal) => {
    saveHistory(newVal);
}, { deep: true });

export const HistoryService = {
    addRecord(item) {
        if (!item || !item.id || !item.type) return;

        const filtered = historyRecords.value.filter(r => !(r.id === item.id && r.type === item.type));

        const newRecord = {
            id: item.id,
            type: item.type,
            title: item.title,
            preview: item.preview,
            progress: item.progress || 0,
            timestamp: Date.now()
        };

        historyRecords.value = [newRecord, ...filtered].slice(0, MAX_HISTORY);
        syncToServer(newRecord);
    },

    getRecords(filterType = 'all') {
        if (filterType === 'all') {
            return historyRecords.value;
        }
        return historyRecords.value.filter(r => r.type === filterType);
    },

    removeRecord(id, type) {
        historyRecords.value = historyRecords.value.filter(r => !(r.id === id && r.type === type));
    },

    clearHistory() {
        historyRecords.value = [];
    },

    historyRecords
};
