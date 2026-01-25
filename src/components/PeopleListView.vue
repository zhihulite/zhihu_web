<script setup>
import { ref, onMounted, computed } from 'vue';
import { f7 } from 'framework7-vue';
import $http from '../api/http.js';
import { useUser } from '@/composables/userManager';
import { useHistory } from '../composables/useHistory.js';

const props = defineProps({
    f7route: Object,
    f7router: Object,
    routeId: String
});


const { register, restoreState } = useHistory(props, 'people_list');
const hasHistory = !!restoreState();

const { id: routeId, type: routeType } = props.f7route?.params || {};
const id = routeId || props.id || 'self';
const type = routeType || props.type || 'followees';
const initialTitle = props.f7route?.query?.title || '用户列表';

const { currentUser } = useUser();
const currentType = ref(type);
const people = ref([]);
const isLoading = ref(false);
const hasMore = ref(true);
const lastResult = ref(null);
const pageRef = ref(null);

register({
    state: {
        people,
        isLoading,
        hasMore,
        lastResult,
        currentType
    },
    scroll: () => ({
        main: pageRef.value?.$el?.querySelector('.page-content')
    })
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

const fetchPeople = async (isRefresh = false) => {
    if (isLoading.value) return;
    if (!isRefresh && !hasMore.value) return;

    isLoading.value = true;
    try {
        let res;
        if (isRefresh || !lastResult.value) {
            const url = getUrl(currentType.value);
            res = await $http.get(url, { isWWW: currentType.value !== 'voter' });
        } else {
            res = await lastResult.value.next();
        }

        const rawList = res.data || [];
        const mapped = rawList.map(item => resolveData(item));
        if (isRefresh) {
            people.value = mapped;
        } else {
            people.value.push(...mapped);
        }
        lastResult.value = res;
        hasMore.value = !res.paging?.is_end;
    } catch (e) {
        console.error('Failed to fetch people:', e);
    } finally {
        isLoading.value = false;
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
    try {
        if (currentType.value.startsWith('block')) {
            if (person.isBlocked) {
                await $http.delete(`https://api.zhihu.com/settings/blocked_users/${person.id}`, "", { encryptHead: true, encryptBody: false });
                person.isBlocked = false;
                f7.toast.show({ text: '已解除屏蔽' });
            } else {
                await $http.post(`https://api.zhihu.com/settings/blocked_users`, `people_id=${person.id}`, { encryptHead: true, encryptBody: false });
                person.isBlocked = true;
                f7.toast.show({ text: '已屏蔽' });
            }
        } else if (currentType.value === 'voter') {
            // skip
        } else {
            if (person.isFollowing) {
                await $http.delete(`https://api.zhihu.com/people/${person.id}/followers/${currentUser.value?.id || 'self'}`, "", { encryptHead: true, encryptBody: false });
                person.isFollowing = false;
                f7.toast.show({ text: '已取关' });
            } else {
                await $http.post(`https://api.zhihu.com/people/${person.id}/followers`, "", { encryptHead: true, encryptBody: false });
                person.isFollowing = true;
                f7.toast.show({ text: '已关注' });
            }
        }
    } catch (e) {
        f7.toast.show({ text: '操作失败' });
    }
};

const switchBlockType = (newType) => {
    currentType.value = newType;
    fetchPeople(true);
};

const openBlockMenu = () => {
    f7.actions.create({
        buttons: [
            [
                { text: '屏蔽过滤器', label: true },
                { text: '全部黑名单', onClick: () => switchBlockType('block_all') },
                { text: '瓦力黑名单', onClick: () => switchBlockType('block_walle') }
            ],
            [{ text: '取消', color: 'red' }]
        ]
    }).open();
};

const navigateToUser = (userId) => {
    props.f7router.navigate(`/user/${userId}`);
};

const onRefresh = async (done) => {
    await fetchPeople(true);
    done();
};

const onInfinite = () => {
    fetchPeople();
};

onMounted(() => {
    if (!hasHistory) {
        fetchPeople(true);
    }
});
</script>

<template>
    <f7-page name="people-list" ptr @ptr:refresh="onRefresh" infinite @infinite="onInfinite"
        :ref="(el) => pageRef = el">
        <f7-navbar :title="pageTitle" back-link="返回">
            <f7-nav-right v-if="currentType.startsWith('block')">
                <f7-link icon-only @click="openBlockMenu">
                    <f7-icon ios="f7:slider_horizontal_3" md="material:filter_list" />
                </f7-link>
            </f7-nav-right>
        </f7-navbar>

        <f7-list media-list no-hairlines class="people-list">
            <f7-list-item v-for="person in people" :key="person.id" :title="person.name" :subtitle="person.headline"
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

        <div v-if="!hasMore && people.length > 0" class="padding text-align-center text-color-gray no-more">
            没有更多了
        </div>
        <div v-if="!isLoading && people.length === 0" class="empty-state">
            <f7-icon f7="person_3_fill" size="48" color="gray" />
            <p>列表为空</p>
        </div>
    </f7-page>
</template>

<style scoped>
.person-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 32px;
    color: #8e8e93;
}

.no-more {
    font-size: 13px;
}
</style>
