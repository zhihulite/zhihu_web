<script setup>
import { onMounted, computed } from 'vue';
import { f7 } from 'framework7-vue';

const props = defineProps({
    f7router: Object,
    f7route: Object
});

const messageId = computed(() => props.f7route?.params?.id || null);

const messagesUrl = computed(() => {
    if (messageId.value) {
        return `https://www.zhihu.com/messages/${messageId.value}`;
    }
    return 'https://www.zhihu.com/messages';
});

const showMessageDialog = () => {
    f7.dialog.confirm(
        '私信功能需要在知乎网页版使用，是否立即跳转？',
        '私信',
        () => {
            $openLink(messagesUrl.value);
            if (props.f7router) {
                props.f7router.back();
            }
        },
        () => {
            if (props.f7router) {
                props.f7router.back();
            }
        }
    );
};

onMounted(() => {
    showMessageDialog();
});
</script>

<template>
    <f7-page name="messages">
        <f7-navbar title="私信" back-link="返回" />

        <div class="message-guide">
            <f7-icon f7="chat_bubble_2_fill" size="64" color="gray" />
            <h3>私信功能</h3>
            <p>私信功能需要在知乎网页版使用</p>
            <f7-button fill large @click="showMessageDialog">
                前往知乎网页版
            </f7-button>
        </div>
    </f7-page>
</template>

<style scoped>
.message-guide {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 32px;
    text-align: center;
    color: #8e8e93;
}

.message-guide h3 {
    margin: 16px 0 8px;
    font-size: 20px;
    font-weight: 600;
    color: #000;
}

.message-guide p {
    margin: 0 0 24px;
    font-size: 14px;
}

.message-guide .f7-button {
    margin-top: 8px;
}
</style>
