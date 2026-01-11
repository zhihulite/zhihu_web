import { ref, watch } from 'vue';

const HISTORY_KEY = 'zhihu_lite_history';
const MAX_HISTORY = 200;

const historyRecords = ref(loadHistory());

function loadHistory() {
    try {
        const data = localStorage.getItem(HISTORY_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Failed to load history', e);
        return [];
    }
}

function saveHistory(records) {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(records));
    } catch (e) {
        console.error('Failed to save history', e);
    }
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
            timestamp: Date.now()
        };

        const updated = [newRecord, ...filtered].slice(0, MAX_HISTORY);
        historyRecords.value = updated;
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
        if (confirm('确定要清空所有历史记录吗？')) {
            historyRecords.value = [];
        }
    },

    historyRecords
};