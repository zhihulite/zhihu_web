<script setup>
import { onMounted } from 'vue'
import { requestLogin } from '@/core/login-dialog.js'
import { toggleSidePanel } from '@/core/layout.js'
import { useUser } from '@/composables/userManager'

const props = defineProps({
    f7router: Object
})

const navigateToSearch = () => {
    if (props.f7router) props.f7router.navigate('/search')
}

const handleAvatarClick = () => {
    if (!isLoggedIn.value) {
        requestLogin()
    } else if (props.f7router && currentUser.value?.id) {
        props.f7router.navigate(`/user/${currentUser.value.id}`)
    }
}


const {
    currentUser,
    isLoggedIn,
    refreshUser,
} = useUser()

onMounted(() => {
    refreshUser()
})

// 双击标题回到顶部：滚当前激活 tab 的内容容器
const scrollToTop = () => {
    const el = document.querySelector('.page-name-home .tab-active .page-content')
        || document.querySelector('.page-name-home .page-content')
    el?.scrollTo({ top: 0, behavior: 'smooth' })
}

</script>

<template>
    <f7-navbar>
        <f7-nav-left>
            <f7-link icon-only @click="toggleSidePanel">
                <f7-icon ios="f7:menu" md="material:menu" />
            </f7-link>
        </f7-nav-left>

        <f7-nav-title @dblclick="scrollToTop">
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
}

@media (max-width: 640px) {
}
</style>
