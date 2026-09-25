<script setup>
import { ref, computed, watch, onMounted, onUpdated, nextTick } from 'vue';
import { f7 } from 'framework7-vue';
import $http from '@/services/http.js';
import { themeSettings, activeThemeHex } from '@/composables/useThemeSettings.js';
import { settings, blockWordList } from '@/core/settings.js';
import { homeTabs as homeTabsStore, saveHomeTabs } from '@/core/home-tabs.js';
import { KEYS, getString, setString, removeKeys } from '@/services/storage.js';

const cityGroups = ref([]);
const cityLoaded = computed(() => cityGroups.value.length > 0);

onMounted(() => {
  fetchCityList();
});
// 城市列表接口返回分组数据，Smart Select 分组渲染，选中即保存
const fetchCityList = async () => {
    try {
        const res = await $http.get('https://api.zhihu.com/feed-root/sections/cityList');
        cityGroups.value = (res?.result_info || []).map((section) => ({
            key: section.city_key,
            cities: (section.city_info_list || []).map((c) => c.city_name),
        }));
    } catch (e) {
        console.error('Failed to fetch city list', e);
        f7.toast.show({ text: '获取城市列表失败' });
    }
};

const saveCity = async (cityName) => {
    if (!cityName) return;
    try {
        await $http.post('https://api.zhihu.com/feed-root/sections/saveUserCity', JSON.stringify({ city: cityName }), {
            encryptHead: true, encryptBody: false,
            headers: {
                'Content-Type': 'application/json',
            }
        });
        window.dispatchEvent(new Event('home-recommendtab-settings-changed'));
        f7.toast.show({ text: '修改成功，您可能需要刷新页面才能看到更改' });
    } catch (e) {
        console.error('Failed to save city', e);
        f7.toast.show({ text: '修改失败，请重试' });
    }
};

const TAB_DEFS = [
    { id: 'recommend', label: '推荐' },
    { id: 'following', label: '关注' },
    { id: 'hot', label: '热榜' },
    { id: 'thoughts', label: '想法' },
];

/** 主页栏目的初始配置：顺序、全启用、主页与关注子页均为推荐 */
const tabsDefault = () => ({
    tabs: TAB_DEFS.map((t) => ({ ...t, enabled: true })),
    default: 'recommend',
    defaultFollowing: 'recommend',
});

const homeTabs = ref([]);
const defaultTab = ref('');
const defaultFollowingTab = ref('recommend');

const showTabsPopup = ref(false);

const followingCheckOptions = [
    { value: 'recommend', label: '精选' },
    { value: 'timeline', label: '最新' },
    { value: 'pin', label: '想法' }
];

const openTabsSettings = () => {
    showTabsPopup.value = true;
};

const enabledTabs = computed(() => homeTabs.value.filter(t => t.enabled));
const disabledTabs = computed(() => homeTabs.value.filter(t => !t.enabled));

const onSort = (event) => {
    const { from, to } = event;
    const enabled = [...enabledTabs.value];
    const movedItem = enabled.splice(from, 1)[0];
    enabled.splice(to, 0, movedItem);

    homeTabs.value = [...enabled, ...disabledTabs.value];
};

const addToDisabled = (tab) => {
    if (enabledTabs.value.length <= 2) {
        f7.toast.show({ text: '至少需要启用两个标签页' });
        return;
    }

    const tabIndex = homeTabs.value.findIndex(t => t.id === tab.id);
    if (tabIndex > -1) {
        homeTabs.value[tabIndex].enabled = false;
        if (defaultTab.value === tab.id) {
            const firstEnabled = homeTabs.value.find(t => t.enabled);
            defaultTab.value = firstEnabled ? firstEnabled.id : '';
        }
    }
};

const addToEnabled = (tab) => {
    const tabIndex = homeTabs.value.findIndex(t => t.id === tab.id);
    if (tabIndex > -1) {
        const item = homeTabs.value[tabIndex];
        item.enabled = true;
        homeTabs.value.splice(tabIndex, 1);

        const lastEnabledIndex = homeTabs.value.findLastIndex(t => t.enabled);
        homeTabs.value.splice(lastEnabledIndex + 1, 0, item);
    }
};

const setDefaultTab = (id) => {
    defaultTab.value = id;
};

const saveSettings = (toastText) => {
    saveHomeTabs({
        tabs: homeTabs.value.map(t => ({ id: t.id, enabled: t.enabled })),
        default: defaultTab.value,
        defaultFollowing: defaultFollowingTab.value,
    });
    if (toastText) f7.toast.show({ text: toastText });
};

const loadSettings = () => {
    const defs = new Map(TAB_DEFS.map((t) => [t.id, t]));
    const enabledById = new Map(homeTabsStore.tabs.map((t) => [t.id, t.enabled]));
    const ordered = homeTabsStore.tabs.map((t) => defs.get(t.id)).filter(Boolean);
    defs.forEach((t, id) => {
        if (!homeTabsStore.tabs.some((s) => s.id === id)) ordered.push(t);
    });
    homeTabs.value = ordered.map((t) => ({ ...t, enabled: enabledById.get(t.id) !== false }));
    defaultTab.value = homeTabsStore.default || 'recommend';
    defaultFollowingTab.value = homeTabsStore.defaultFollowing || 'recommend';
};

loadSettings();

// 恢复默认由自身给出提示，自动保存不再重复弹「已保存」
let silentNextSave = false;
watch([homeTabs, defaultTab, defaultFollowingTab], () => {
    const text = silentNextSave ? '' : '已保存';
    silentNextSave = false;
    saveSettings(text);
}, { deep: true });

const restoreTabsDefault = () => {
    const d = tabsDefault();
    silentNextSave = true;
    homeTabs.value = d.tabs;
    defaultTab.value = d.default;
    defaultFollowingTab.value = d.defaultFollowing;
    // 值未变化时 watcher 不会触发，微任务里清掉标记避免影响后续提示
    Promise.resolve().then(() => { silentNextSave = false; });
    f7.toast.show({ text: '已恢复默认' });
};

const themeColorHex = computed(() => activeThemeHex());
const fontSizePx = computed(() => parseInt(themeSettings.fontSize, 10) || 16);

// 深浅色互斥：手动开夜间要退出跟随系统，反之亦然
const setDarkMode = (checked) => {
    if (checked && themeSettings.followSystem) {
        themeSettings.followSystem = false;
        f7.toast.show({ text: '已自动关闭「跟随系统深色模式」' });
    }
    themeSettings.darkMode = checked;
};

const setFollowSystem = (checked) => {
    if (checked && themeSettings.darkMode) {
        themeSettings.darkMode = false;
        f7.toast.show({ text: '已自动关闭「夜间模式」' });
    }
    themeSettings.followSystem = checked;
};

const showMsidTutorial = ref(false);

const openMsidTutorial = () => {
    showMsidTutorial.value = true;
};

const setMsid = () => {
    f7.dialog.prompt('请输入数盟ID (留空则使用默认)', '设置数盟ID', (value) => {
        if (!value) {
            removeKeys(KEYS.msid);
            f7.toast.show({ text: '已恢复默认ID', closeTimeout: 2000 });
        } else {
            setString(KEYS.msid, value);
            f7.toast.show({ text: '设置成功', closeTimeout: 2000 });
        }
    }, () => { }, getString(KEYS.msid) || '');
};

const blockWordCount = computed(() => blockWordList().length);

const editBlockWords = () => {
    f7.dialog.prompt('多个词用逗号或换行分隔，命中标题/摘要的内容将被过滤', '屏蔽词', (value) => {
        settings.blockWords = value || '';
        f7.toast.show({ text: '已保存', closeTimeout: 2000 });
    }, () => { }, settings.blockWords || '');
};

const searchEngineName = computed(() => {
    try {
        return new URL(settings.searchEngineUrl).hostname.replace(/^www\./, '');
    } catch {
        return '自定义';
    }
});

// 双栏断点在 View 创建时读一次，开关只能下次启动再生效
const setParallelWorld = (checked) => {
    settings.parallelWorld = checked;
    f7.toast.show({
        text: checked ? '平行世界已开启，重启生效' : '平行世界已关闭，重启生效',
        closeTimeout: 2000,
    });
};

// 推荐分区管理：拉取分区列表（含「全站」），按偏好排序并支持显隐与拖拽
const showSectionsPopup = ref(false);
const sectionList = ref([]);

const isSectionHidden = (s) => (settings.hiddenSections || []).includes(s.section_id);

const toggleSectionHidden = (s, visible) => {
    const hidden = new Set(settings.hiddenSections || []);
    if (visible) hidden.delete(s.section_id);
    else hidden.add(s.section_id);
    settings.hiddenSections = [...hidden];
};

// sortable:sort 的载荷是移动前后的下标（F7 已经把 DOM 节点挪好），按下标重排数组再落盘
const onSectionSort = ({ from, to }) => {
    const ordered = [...sectionList.value];
    const [moved] = ordered.splice(from, 1);
    ordered.splice(to, 0, moved);
    sectionList.value = ordered;
    settings.sectionOrder = ordered.map((s) => s.section_id);
};

const loadSections = async () => {
    try {
        const res = await $http.get('https://api.zhihu.com/feed-root/sections/query/v2', { isWWW: true });
        const raw = res.selected_sections || [];
        const all = settings.hideAllSection
            ? raw
            : [{ section_name: '全站', section_id: null }, ...raw];

        // 按已保存顺序排列，未列出的保持原序
        const order = settings.sectionOrder || [];
        const rank = (s) => {
            const i = order.indexOf(s.section_id);
            return i === -1 ? order.length : i;
        };
        sectionList.value = all
            .map((s, i) => ({ s, i }))
            .sort((a, b) => rank(a.s) - rank(b.s) || a.i - b.i)
            .map(({ s }) => s);
    } catch (e) {
        console.error('读取推荐分区失败', e);
    }
};

watch(showSectionsPopup, (open) => {
    if (open) loadSections();
});

const editSearchEngine = () => {
    f7.dialog.prompt('站内未匹配时的兜底搜索地址，关键词会拼在末尾', '站外搜索引擎', (value) => {
        if (value && value.trim()) {
            settings.searchEngineUrl = value.trim();
            f7.toast.show({ text: '已保存', closeTimeout: 2000 });
        }
    }, () => { }, settings.searchEngineUrl || '');
};

const pageRef = ref(null);
const searchKeyword = ref('');

// 设置项按 DOM 顺序分组成「block-title + 其后若干列表/控件块」；内容整体在 page-content 里
const sectionGroups = (root) => {
    const content = root.querySelector(':scope > .page-content') || root;
    const nodes = [...content.children].filter((el) => el.matches('.block-title, .list, .block'));
    const groups = [];
    nodes.forEach((el) => {
        if (el.classList.contains('block-title')) groups.push({ title: el, bodies: [] });
        else if (groups.length > 0) groups[groups.length - 1].bodies.push(el);
        else groups.push({ title: null, bodies: [el] });
    });
    return groups;
};

// 组内可过滤单元：list 拆成逐行，block 整块参与匹配
const unitsOf = (group) => group.bodies.flatMap((el) =>
    el.classList.contains('list') ? [...el.querySelectorAll('li')] : [el]
);

// 只取列表项的标题/副标题/右侧文案，避开智能选择里整份 option 文本
// 整块文本一起比：滑杆行的标题只是普通 span，挑类名取会漏掉它们
const unitText = (unit) => unit.textContent.toLowerCase();

const applySearchFilter = () => {
    const root = pageRef.value?.$el;
    if (!root) return;
    const groups = sectionGroups(root);
    groups.forEach((group) => {
        if (group.title) group.title.style.display = '';
        group.bodies.forEach((el) => {
            el.style.display = '';
            [...el.querySelectorAll('li')].forEach((row) => { row.style.display = ''; });
        });
    });

    const kw = searchKeyword.value.trim().toLowerCase();
    if (!kw) return;

    groups.forEach((group) => {
        const titleHit = group.title && group.title.textContent.toLowerCase().includes(kw);
        let anyHit = false;
        unitsOf(group).forEach((unit) => {
            const hit = titleHit || unitText(unit).includes(kw);
            unit.style.display = hit ? '' : 'none';
            if (hit) anyHit = true;
        });
        if (anyHit) return;
        group.bodies.forEach((el) => { el.style.display = 'none'; });
        if (group.title) group.title.style.display = 'none';
    });
};

watch(searchKeyword, () => nextTick(applySearchFilter));

// 开关展开的行、条件渲染的行要在重渲染后重新套用过滤；关键词为空时过滤已是复位状态
onUpdated(() => {
    if (searchKeyword.value.trim()) applySearchFilter();
});
</script>

<template>
    <f7-page name="settings" ref="pageRef">
        <f7-navbar title="设置" back-link="返回">
            <f7-nav-right>
                <f7-link class="searchbar-enable" data-searchbar=".settings-searchbar" icon-ios="f7:search"
                    icon-md="material:search" />
            </f7-nav-right>
            <f7-searchbar class="settings-searchbar" custom-search expandable v-model:value="searchKeyword"
                placeholder="搜索设置项" clear-button @searchbar:clear="searchKeyword = ''"
                @searchbar:disable="searchKeyword = ''" />
        </f7-navbar>

        <f7-block-title>外观与主题</f7-block-title>
        <f7-list strong inset media-list>
            <f7-list-item title="主题色" subtitle="更换应用强调色" link="/settings/theme/" :after="themeColorHex"></f7-list-item>
            <f7-list-item title="页面布局" subtitle="字号、页边距与卡片间距，可实时预览" link="/settings/page-layout/">
                <template #after>
                    <span>{{ fontSizePx }} px · {{ settings.pageMargin }} px</span>
                </template>
            </f7-list-item>
            <f7-list-item title="夜间模式" subtitle="手动切换深色界面">
                <template #after>
                    <f7-toggle :checked="themeSettings.darkMode" @change="setDarkMode($event.target.checked)" />
                </template>
            </f7-list-item>
            <f7-list-item title="跟随系统深色模式" subtitle="深浅色与系统设置保持一致">
                <template #after>
                    <f7-toggle :checked="themeSettings.followSystem"
                        @change="setFollowSystem($event.target.checked)" />
                </template>
            </f7-list-item>
            <f7-list-item title="OLED 纯黑" subtitle="背景改为纯黑，仅夜间模式下生效">
                <template #after>
                    <f7-toggle :checked="themeSettings.oledMode"
                        @change="themeSettings.oledMode = $event.target.checked" />
                </template>
            </f7-list-item>
        </f7-list>

        <f7-block-title>浏览与内容</f7-block-title>
        <f7-list strong inset media-list>
            <f7-list-item title="无图模式" subtitle="列表与文章不加载网络图片">
                <template #after>
                    <f7-toggle :checked="settings.noImage"
                        @change="settings.noImage = $event.target.checked" />
                </template>
            </f7-list-item>
            <f7-list-item title="屏蔽词" subtitle="过滤含关键词的列表内容" link="#" @click="editBlockWords">
                <template #after>
                    <span>{{ blockWordCount > 0 ? `${blockWordCount} 个` : '未设置' }}</span>
                </template>
            </f7-list-item>
            <f7-list-item title="搜索引擎" subtitle="设置站外搜索跳转的 URL 模板" link="#" @click="editSearchEngine">
                <template #after>
                    <span>{{ searchEngineName }}</span>
                </template>
            </f7-list-item>
            <f7-list-item title="关闭热门搜索" subtitle="搜索页不展示热门词">
                <template #after>
                    <f7-toggle :checked="settings.closeHotSearch"
                        @change="settings.closeHotSearch = $event.target.checked" />
                </template>
            </f7-list-item>
            <f7-list-item title="平行世界" subtitle="平板双栏布局，重启生效">
                <template #after>
                    <f7-toggle :checked="settings.parallelWorld" @change="setParallelWorld($event.target.checked)" />
                </template>
            </f7-list-item>
        </f7-list>

        <f7-block-title>回答页</f7-block-title>
        <f7-list strong inset media-list>
            <f7-list-item title="回答单页" subtitle="关闭上下滑切换，一次只看一条回答">
                <template #after>
                    <f7-toggle :checked="settings.answerSinglePage"
                        @change="settings.answerSinglePage = $event.target.checked" />
                </template>
            </f7-list-item>
            <f7-list-item title="代码块自动换行" subtitle="过长时换行显示，关闭则横向滑动查看">
                <template #after>
                    <f7-toggle :checked="settings.codeWrap" @change="settings.codeWrap = $event.target.checked" />
                </template>
            </f7-list-item>
            <f7-list-item title="悬浮滚动按钮" subtitle="回答页显示上下滚动按钮">
                <template #after>
                    <f7-toggle :checked="settings.floatScrollButtons"
                        @change="settings.floatScrollButtons = $event.target.checked" />
                </template>
            </f7-list-item>
        </f7-list>

        <f7-block-title>数据与存储</f7-block-title>
        <f7-list strong inset media-list>
            <f7-list-item title="推荐去重窗口" text="记住已读推荐用于去重，0 为关闭"
                :after="settings.dedupWindow > 0 ? `${settings.dedupWindow} 条` : '关闭'">
                <f7-range :min="0" :max="200" :step="1" :value="settings.dedupWindow"
                    @range:changed="settings.dedupWindow = $event" />
            </f7-list-item>
        </f7-list>

        <f7-block-title>主页</f7-block-title>
        <f7-list strong inset media-list>
            <f7-list-item title="热榜不显示封面" subtitle="热榜条目只保留文字">
                <template #after>
                    <f7-toggle :checked="settings.hotHideImage"
                        @change="settings.hotHideImage = $event.target.checked" />
                </template>
            </f7-list-item>
            <f7-list-item title="热榜不显示热度" subtitle="隐藏热榜的热度数值">
                <template #after>
                    <f7-toggle :checked="settings.hotHideMetrics"
                        @change="settings.hotHideMetrics = $event.target.checked" />
                </template>
            </f7-list-item>
            <f7-list-item title="隐藏推荐「全站」" subtitle="推荐流去掉全站分区">
                <template #after>
                    <f7-toggle :checked="settings.hideAllSection"
                        @change="settings.hideAllSection = $event.target.checked" />
                </template>
            </f7-list-item>
            <f7-list-item v-if="cityLoaded" title="推荐地点" subtitle="修改推荐流对应的城市" smart-select
                :smart-select-params="{ openIn: 'page', searchbar: true, searchbarPlaceholder: '搜索城市', closeOnSelect: true }">
                <select @change="saveCity($event.target.value)">
                    <option value="" disabled selected>选择推荐城市</option>
                    <optgroup v-for="group in cityGroups" :key="group.key" :label="group.key">
                        <option v-for="city in group.cities" :key="city" :value="city">{{ city }}</option>
                    </optgroup>
                </select>
            </f7-list-item>
            <f7-list-item title="关注默认栏" subtitle="打开关注时默认精选、最新或想法" smart-select
                :smart-select-params="{ openIn: 'sheet', closeOnSelect: true }">
                <select v-model="defaultFollowingTab">
                    <option v-for="opt in followingCheckOptions" :key="opt.value" :value="opt.value">{{ opt.label }}
                    </option>
                </select>
            </f7-list-item>
            <f7-list-item title="主页栏目顺序" subtitle="调整主页顶部栏目的排列" link="#" @click="openTabsSettings">
                <template #after>
                    <span>{{ enabledTabs.length }} 个启用</span>
                </template>
            </f7-list-item>
            <f7-list-item title="推荐分区管理" subtitle="调整推荐流分区的显示与顺序" link="#"
                @click="showSectionsPopup = true"></f7-list-item>
        </f7-list>

        <f7-block-title>开发者</f7-block-title>
        <f7-list strong inset media-list>
            <f7-list-item title="数盟ID获取教程" subtitle="说明如何取到本机数盟ID" link="#"
                @click="openMsidTutorial"></f7-list-item>
            <f7-list-item title="设置数盟ID" subtitle="用手动填写的数盟ID发请求" link="#" @click="setMsid"></f7-list-item>
        </f7-list>

        <f7-block-title>关于</f7-block-title>
        <f7-list strong inset media-list>
            <f7-list-item title="关于" subtitle="版本、更新说明与开源仓库" link="/settings/about/"></f7-list-item>
            <f7-list-item title="自动检测更新" subtitle="启动时检查新版本">
                <template #after>
                    <f7-toggle :checked="settings.autoCheckUpdate"
                        @change="settings.autoCheckUpdate = $event.target.checked" />
                </template>
            </f7-list-item>
        </f7-list>

        <f7-popup :opened="showTabsPopup" class="tabs-popup" @popup:closed="showTabsPopup = false">
            <f7-page>
                <f7-navbar title="主页标签管理">
                    <f7-nav-right>
                        <f7-link @click="restoreTabsDefault">恢复默认</f7-link>
                        <f7-link @click="showTabsPopup = false">完成</f7-link>
                    </f7-nav-right>
                </f7-navbar>

                <f7-block-title>当前主页 (长按拖动排序)</f7-block-title>
                <f7-list sortable sortable-enabled @sortable:sort="onSort" class="no-margin-top">
                    <f7-list-item v-for="tab in enabledTabs" :key="tab.id" :title="tab.label" radio
                        :checked="defaultTab === tab.id" @change="setDefaultTab(tab.id)" name="default_tab_radios">
                        <template #after>
                            <f7-link icon-f7="minus_circle_fill" icon-color="red" @click.stop="addToDisabled(tab)"
                                style="margin-right: 8px;" />
                        </template>
                    </f7-list-item>
                </f7-list>
                <f7-block-footer>点击左侧单选框设置默认启动页</f7-block-footer>

                <f7-block-title>其他</f7-block-title>
                <f7-list>
                    <f7-list-item v-for="tab in disabledTabs" :key="tab.id" :title="tab.label">
                        <template #after>
                            <f7-link icon-f7="plus_circle_fill" icon-color="green" @click="addToEnabled(tab)" />
                        </template>
                    </f7-list-item>
                </f7-list>
            </f7-page>
        </f7-popup>

        <f7-popup :opened="showSectionsPopup" class="sections-popup" @popup:closed="showSectionsPopup = false">
            <f7-page>
                <f7-navbar title="推荐分区管理">
                    <f7-nav-right>
                        <f7-link @click="showSectionsPopup = false">完成</f7-link>
                    </f7-nav-right>
                </f7-navbar>

                <f7-block-title>长按拖动排序</f7-block-title>
                <f7-list sortable sortable-enabled @sortable:sort="onSectionSort" class="no-margin-top">
                    <f7-list-item v-for="s in sectionList" :key="String(s.section_id)" :title="s.section_name">
                        <template #after>
                            <f7-toggle :checked="!isSectionHidden(s)"
                                @change="toggleSectionHidden(s, $event.target.checked)" />
                        </template>
                    </f7-list-item>
                </f7-list>
                <f7-block-footer>关闭开关可隐藏该分区；顺序与显隐会应用到主页推荐</f7-block-footer>

                <f7-list strong inset v-if="sectionList.length === 0">
                    <f7-list-item title="暂无分区数据（需登录后加载）"></f7-list-item>
                </f7-list>
            </f7-page>
        </f7-popup>

        <f7-popup :opened="showMsidTutorial" @popup:closed="showMsidTutorial = false" swipe-to-close>
            <f7-page>
                <f7-navbar title="数盟ID获取教程">
                    <f7-nav-right>
                        <f7-link @click="showMsidTutorial = false">关闭</f7-link>
                    </f7-nav-right>
                </f7-navbar>
                <f7-block>
                    <p>下载元萝卜 <f7-link external
                            href="https://github.com/Katana-Official/SPatch-Update/releases">https://github.com/Katana-Official/SPatch-Update/releases</f7-link>
                    </p>
                    <p>安装mt管理器和知乎 打开分身的知乎同意协议进入主页后 退出打开mt管理器 进入侧滑 点击终端执行器 执行以下命令</p>
                    <f7-block strong inset class="code-block" style="word-break: break-all; user-select: text;">
                        grep 'name="device_id"'
                        /data/user/0/top.bienvenido.saas.i18n/app_data_anon/com.zhihu.android/0/shared_prefs/com.zhihu.android_dna.xml
                        | sed 's/.*&lt;string name="device_id"&gt;\([^&lt;]*\)&lt;\/string&gt;.*/\1/'
                    </f7-block>
                    <p>如果是root 就不用这一步 直接打开mt管理器 输入su后将上述指令的 /data/user/0/top.bienvenido.saas.i18n/app_data_anon/com.zhihu.android/0/ 替换为 /data/user/0/com.zhihu.android/ 执行即可得到参数</p>
                    <p>将输出文本复制粘贴到这里即可</p>
                    <p>或者去github.com或其他途径搜索 x-ms-id 将他的输出参数复制即可 留空则为使用默认ms-id</p>
                </f7-block>
            </f7-page>
        </f7-popup>
    </f7-page>
</template>
