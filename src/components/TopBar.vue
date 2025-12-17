<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import MaterialSymbol from './MaterialSymbol.vue'
import LoginDialog from './LoginDialog.vue'
import { useUser } from '@/composables/userManager'

const router = useRouter()
const showLogin = ref(false)

const toggleDrawer = () => {
    const drawer = document.querySelector('s-drawer')
    if (drawer && typeof drawer.toggle === 'function') {
        drawer.toggle()
    }
}

const navigateToSearch = () => {
    router.push('/search')
}

const handleAvatarClick = () => {
    if (!isLoggedIn.value) {
        showLogin.value = true
    }
}


const {
  currentUser,
  isLoggedIn,
  isRefreshing,
  refreshUser,
  onUserUpdate
} = useUser()

// 订阅用户数据更新
let unsubscribe = null
onMounted(() => {
    refreshUser()
    // 添加用户数据更新订阅
    unsubscribe = onUserUpdate((updatedUserData) => {
        console.log('User data updated in TopBar:', updatedUserData)
    })
})

onUnmounted(() => {
    // 组件卸载时取消订阅，防止内存泄漏
    if (unsubscribe) {
        unsubscribe()
    }
})

const onLoginSuccess = () => {
    showLogin.value = false
    refreshUser()
}

</script>

<template>
    <s-appbar style="width: 100%; z-index: 0;">
        <s-icon-button slot="navigation" @click="toggleDrawer">
            <MaterialSymbol icon="menu" />
        </s-icon-button>

        <div slot="headline" class="headline">
            Zyphron
        </div>

        <s-search slot="search" placeholder="搜索关键字..." readonly @click="navigateToSearch"
            style="cursor: pointer;"></s-search>

        <div slot="action" class="action-container">
            <s-icon-button class="desktop-only">
                <MaterialSymbol icon="notifications" />
            </s-icon-button>

            <s-icon-button class="tablet-only">
                <MaterialSymbol icon="chat_bubble" />
            </s-icon-button>
            <s-avatar :src="currentUser?.avatar_url" class="avatar" @click="handleAvatarClick">
                <span v-if="!isLoggedIn">游客</span>
            </s-avatar>
        </div>
    </s-appbar>
    <LoginDialog v-model="showLogin" @login-success="onLoginSuccess" />
</template>

<style scoped>
.action-container {
    display: flex;
    align-items: center;
    gap: 4px;
}

.avatar {
    margin-left: 8px;
    cursor: pointer;
}

@media (max-width: 768px) {
    .desktop-only {
        display: none;
    }
}

@media (max-width: 640px) {
    .tablet-only {
        display: none;
    }
}
</style>
