<script setup>
import { ref, onMounted, computed } from 'vue';
import { destroyOnClosed } from '@/utils/modal.js';
import { f7 } from 'framework7-vue';
import $http from '@/services/http.js';
import { useUser, requireLogin } from '@/composables/userManager';
import { blockUser, unblockUser } from '@/composables/useBlockToggle.js';
import { followUser, unfollowUser } from '@/composables/useFollowToggle.js';
import { usePageState } from '@/composables/usePageState.js';
import { usePagedList } from '@/composables/usePagedList.js';
import EmptyState from '@/components/EmptyState.vue';
import LoadMoreFooter from '@/components/LoadMoreFooter.vue';

const props = defineProps({
    f7route: Object,
    f7router: Object
});

const { id: paramId, type: routeType } = props.f7route?.params || {};
const id = paramId || 'self';
const type = routeType || 'followees';
const initialTitle = props.f7route?.query?.title || '用户列表';

const { currentUser } = useUser();
const currentType = ref(type);

const { page, loading, refresh, loadMore, ensureLoaded, reset } = usePagedList({
    name: '用户列表',
    fetch: (signal) => $http.get(getUrl(currentType.value), { isWWW: currentType.value !== 'voter', signal }),
    map: (item) => resolveData(item),
});

const { hasCache } = usePageState({
    state: {
        page,
        currentType
    },
    loading,
});

const pageTitle = computed(() => {
    switch (currentType.value) {
        case 'followees': return '关注列表';
        case 'followers': return '粉丝列表';
        case 'voter': return '点赞列表';
        case 'block_all': return '屏蔽列表';
        case 'block_walle': return '瓦力屏蔽列表';
        default: return initialTitle;
    }
});

const getUrl = (type) => {
    switch (type) {
        case 'voter':
            return `https://api.zhihu.com/pins/${id}/actions`;
        case 'followees':
            return `https://api.zhihu.com/people/${id}/followees`;
        case 'followers':
            return `https://api.zhihu.com/people/${id}/followers`;
        case 'block_all':
            return `https://api.zhihu.com/settings/blocked_users?filter=all`;
        case 'block_walle':
            return `https://api.zhihu.com/settings/blocked_users?filter=walle`;
        default:
            return `https://api.zhihu.com/people/${id}/followees`;
    }
};

const resolveData = (item) => {
    const member =
        item.type === 'pin_action'
            ? item.member
            : (item.member || item);

    const avatar = member?.avatar_url;
    const name = member?.name;
    const headline = member?.headline || '无签名';
    const id = member?.id;
    const actionType = item.type === 'pin_action' ? item.action_type : undefined;
    const isFollowing = item.is_following || item.relationship?.is_following || false;
    const isBlocked = currentType.value.startsWith('block') || item.is_blocking || false;

    return {
        id,
        name,
        avatar,
        headline,
        actionType,
        isFollowing,
        isBlocked,
    };
};

const getActionText = (person) => {
    if (currentType.value.startsWith('block')) {
        return person.isBlocked ? '取消屏蔽' : '屏蔽';
    }
    if (currentType.value === 'voter') {
        return person.actionType === 'like' ? '喜欢了' : '转发了';
    }
    return person.isFollowing ? '取关' : '关注';
};

const handleAction = async (person) => {
    if (!requireLogin()) return;
    try {
        if (currentType.value.startsWith('block')) {
            if (person.isBlocked) {
                await unblockUser(person.id);
                person.isBlocked = false;
                f7.toast.show({ text: '已解除屏蔽' });
            } else {
                await blockUser(person.id);
                person.isBlocked = true;
                f7.toast.show({ text: '已屏蔽' });
            }
        } else if (currentType.value === 'voter') {
            // skip
        } else {
            if (person.isFollowing) {
                await unfollowUser(person.id, currentUser.value?.id || 'self');
                person.isFollowing = false;
                f7.toast.show({ text: '已取关' });
            } else {
                await followUser(person.id);
                person.isFollowing = true;
                f7.toast.show({ text: '已关注' });
            }
        }
    } catch (e) {
        f7.toast.show({ text: '操作失败' });
    }
};

const switchType = (newType) => {
    if (currentType.value === newType) return;
    currentType.value = newType;
    reset();
    refresh();
};

// 菜单项按当前列表类型给出同类可切换目标：粉丝↔关注、全部↔瓦力黑名单
const menuItems = computed(() => {
    if (currentType.value === 'followers' || currentType.value === 'followees') {
        return [
            { text: '粉丝列表', type: 'followers' },
            { text: '关注列表', type: 'followees' },
        ];
    }
    if (currentType.value.startsWith('block')) {
        return [
            { text: '全部黑名单', type: 'block_all' },
            { text: '瓦力黑名单', type: 'block_walle' },
        ];
    }
    return [];
});

const menuTitle = computed(() => (currentType.value.startsWith('block') ? '黑名单' : '用户列表'));

const openMenu = () => {
    const menu = f7.actions.create({
        buttons: [
            [
                { text: menuTitle.value, label: true },
                ...menuItems.value.map((item) => ({ text: item.text, onClick: () => switchType(item.type) })),
            ],
            [{ text: '取消', color: 'red' }]
        ]
    });
    destroyOnClosed(menu).open();
};

const navigateToUser = (userId) => {
    props.f7router.navigate(`/user/${userId}`);
};

const onRefresh = async (done) => {
    await refresh();
    done();
};

const onInfinite = () => {
    loadMore();
};

onMounted(() => {
    if (!hasCache.value) {
        ensureLoaded();
    }
});
</script>

<template>
    <f7-page name="people-list" ptr @ptr:refresh="onRefresh" infinite @infinite="onInfinite">
        <f7-navbar :title="pageTitle" back-link="返回">
            <f7-nav-right v-if="menuItems.length > 0">
                <f7-link icon-only @click="openMenu">
                    <f7-icon ios="f7:ellipsis_vertical" md="material:more_vert" />
                </f7-link>
            </f7-nav-right>
        </f7-navbar>

        <f7-list media-list no-hairlines class="people-list">
            <f7-list-item v-for="person in page.list" :key="person.id" :title="person.name" :subtitle="person.headline"
                link @click="navigateToUser(person.id)">
                <template #media>
                    <img :src="person.avatar" class="person-avatar" />
                </template>
                <template #after>
                    <f7-button small outline :color="person.isBlocked ? 'red' : undefined"
                        @click.stop="handleAction(person)">
                        {{ getActionText(person) }}
                    </f7-button>
                </template>
            </f7-list-item>
        </f7-list>

        <LoadMoreFooter :has-more="page.hasMore" :length="page.list.length" />
        <EmptyState v-if="!loading && page.list.length === 0" icon="person_3_fill" text="列表为空" />
    </f7-page>
</template>

<style scoped>
.person-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
}

</style>
