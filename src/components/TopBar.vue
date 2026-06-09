<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { f7 } from 'framework7-vue'
import LoginDialog from './LoginDialog.vue'
import { useUser } from '@/composables/userManager'

const props = defineProps({
    f7router: Object
})

const showLogin = ref(false)

const navigateToSearch = () => {
    if (props.f7router) props.f7router.navigate('/search')
}

const handleAvatarClick = () => {
    if (!isLoggedIn.value) {
        showLogin.value = true
    } else if (props.f7router && currentUser.value?.id) {
        props.f7router.navigate(`/user/${currentUser.value.id}`)
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
    <f7-navbar>
        <f7-nav-left>
            <f7-link icon-only panel-toggle="left">
                <f7-icon ios="f7:menu" md="material:menu" />
            </f7-link>
        </f7-nav-left>

        <f7-nav-title>
            Zyphron
        </f7-nav-title>

        <f7-nav-right>
            <f7-link @click="navigateToSearch" class="search-link" icon-only>
                <f7-icon ios="f7:search" md="material:search" />
            </f7-link>

            <f7-link @click="handleAvatarClick" class="avatar-link">
                <img v-if="currentUser?.avatar_url" :src="currentUser.avatar_url" class="avatar-img" />
                <span v-else class="guest-label">游客</span>
            </f7-link>
        </f7-nav-right>
    </f7-navbar>

    <LoginDialog v-model="showLogin" @login-success="onLoginSuccess" />
</template>

<style scoped>
.avatar-img {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
}

.guest-label {
    font-size: 14px;
    font-weight: 500;
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
