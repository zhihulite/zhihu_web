<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { f7 } from 'framework7-vue';
import $http from '../api/http.js';

const showCityDialog = ref(false);
const cityListContent = ref('');
const cityInput = ref('');
const isSubmitting = ref(false);

const basePath = window.location.pathname.endsWith('/')
  ? window.location.pathname
  : window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
const appVersion = ref('');
const buildTime = ref(process.env.NODE_ENV === 'production' ? '' : '开发版');
const loadVersionInfo = async () => {
  try {
    const res = await fetch(basePath + 'version.json', { cache: 'no-cache' });
    if (res.ok) {
      const cfg = await res.json();
      appVersion.value = String(cfg.version || '');
      buildTime.value = cfg.builtAt ? new Date(cfg.builtAt).toLocaleString('zh-CN') : '';
      localStorage.setItem('app_version', appVersion.value);
    }
  } catch (e) {
  }
};
const triggerSwUpdate = async () => {
  if (f7 && f7.serviceWorker && typeof f7.serviceWorker.update === 'function') {
    await f7.serviceWorker.update();
  }
};
const checkForUpdate = async () => {
    if (process.env.NODE_ENV !== 'production') {
        f7.toast.show({ text: '开发版不支持检查更新' });
        return;
    }
  f7.preloader.show();
  try {
    const res = await fetch(basePath + 'version.json?ts=' + Date.now(), { cache: 'no-cache' });
    if (!res.ok) {
      f7.toast.show({ text: '读取版本配置失败' });
      return;
    }
    const cfg = await res.json();
    const remoteVer = String(cfg.version || '');
    const localVer = localStorage.getItem('app_version') || '';
    if (remoteVer && remoteVer !== localVer) {
      f7.dialog.confirm('检测到新版本，是否刷新更新？', '更新', async () => {
        await triggerSwUpdate();
        localStorage.setItem('app_version', remoteVer);
        window.location.reload();
      });
    } else {
      f7.toast.show({ text: '当前已是最新版本' });
    }
  } catch (e) {
    f7.toast.show({ text: '检测更新失败' });
  } finally {
    f7.preloader.hide();
  }
};
onMounted(() => {
  loadVersionInfo();
});
const openCitySettings = async () => {
    f7.preloader.show();
    try {
        const res = await $http.get('https://api.zhihu.com/feed-root/sections/cityList');
        if (res && res.result_info) {
            let content = '';
            for (const section of res.result_info) {
                const cityKey = section.city_key;
                content += `${cityKey}\n`;
                for (const city of section.city_info_list) {
                    content += `${city.city_name} `;
                }
                content += '\n\n';
            }
            cityListContent.value = content;
            cityInput.value = '';
            showCityDialog.value = true;
        } else {
            f7.toast.show({ text: '获取城市列表失败' });
        }
    } catch (e) {
        console.error('Failed to fetch city list', e);
        f7.toast.show({ text: '获取城市列表失败' });
    } finally {
        f7.preloader.hide();
    }
};

const saveCity = async () => {
    const cityName = cityInput.value.replace(/\s+/g, '');
    if (!cityName) {
        f7.dialog.alert('请输入城市名称');
        return;
    }

    if (!cityListContent.value.includes(cityName)) {
        f7.toast.show({ text: '你输入了一个不支持的城市' });
        return;
    }

    isSubmitting.value = true;
    try {
        await $http.post('https://api.zhihu.com/feed-root/sections/saveUserCity', JSON.stringify({ city: cityName }), {
            encryptHead: true, encryptBody: false,
            headers: {
                'Content-Type': 'application/json',  // 改为 JSON
            }
        });
        window.dispatchEvent(new Event('home-recommendtab-settings-changed'));
        f7.toast.show({ text: '修改成功，您可能需要刷新页面才能看到更改' });
        showCityDialog.value = false;
    } catch (e) {
        console.error('Failed to save city', e);
        f7.toast.show({ text: '修改失败，请检查输入或重试' });
    } finally {
        isSubmitting.value = false;
    }
};

const handleClose = () => {
    showCityDialog.value = false;
};

const homeTabs = ref([
    { id: 'recommend', label: '推荐', enabled: true },
    { id: 'following', label: '关注', enabled: true },
    { id: 'hot', label: '热榜', enabled: true },
    { id: 'thoughts', label: '想法', enabled: true },
]);
const defaultTab = ref('recommend');

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

const saveSettings = () => {
    const config = {
        tabs: homeTabs.value.map(t => ({ id: t.id, enabled: t.enabled })),
        default: defaultTab.value,
        defaultFollowing: defaultFollowingTab.value
    };
    localStorage.setItem('home_tabs_config', JSON.stringify(config));

    window.dispatchEvent(new Event('home-settings-changed'));
};

const loadSettings = () => {
    try {
        const stored = localStorage.getItem('home_tabs_config');
        if (stored) {
            const config = JSON.parse(stored);
            if (config.tabs && Array.isArray(config.tabs)) {
                const newOrder = [];
                const presentIds = new Set();

                config.tabs.forEach(cTab => {
                    const def = homeTabs.value.find(t => t.id === cTab.id);
                    if (def) {
                        def.enabled = cTab.enabled;
                        newOrder.push(def);
                        presentIds.add(def.id);
                    }
                });

                homeTabs.value.forEach(t => {
                    if (!presentIds.has(t.id)) {
                        newOrder.push(t);
                    }
                });

                homeTabs.value = newOrder;
            }
            if (config.default) {
                defaultTab.value = config.default;
            }
            if (config.defaultFollowing) {
                defaultFollowingTab.value = config.defaultFollowing;
            }
        }
    } catch (e) {
        console.error('Failed to load settings', e);
    }
};

loadSettings();

watch([homeTabs, defaultTab, defaultFollowingTab], () => {
    saveSettings();
}, { deep: true });

const colors = Object.keys(f7.colors).filter((c) => c !== 'primary' && c !== 'white' && c !== 'black');

const currentColor = ref('blue');
const customColor = ref('');
const isCustomColorEnabled = ref(false);

const isDarkMode = ref(false);
const isFollowSystem = ref(false);
const isMonochrome = ref(false);
const isVibrant = ref(false);

const setColorTheme = (color) => {
    if (isCustomColorEnabled.value) {
        f7.dialog.alert('请先关闭自定义颜色开关，才能设置预设主题色。');
        return;
    }
    currentColor.value = color;
    const hex = f7.colors[color];
    f7.setColorTheme(hex);
    saveThemeSettings();
};

const customColorPickerValue = computed({
    get: () => {
        return { hex: customColor.value || '#000000' };
    },
    set: (val) => {
        if (val && val.hex) {
            setCustomColor(val.hex);
        }
    }
});

const setCustomColor = (hex) => {
    if (!hex) return;
    customColor.value = hex;

    if (isCustomColorEnabled.value) {
        f7.setColorTheme(hex);
        saveThemeSettings();
    }
};

const toggleCustomColor = (checked) => {
    isCustomColorEnabled.value = checked;
    if (checked) {
        const hex = customColor.value || '#000000';
        f7.setColorTheme(hex);
        f7.dialog.alert('开启后只有关闭自定义颜色开关，才能设置预设主题色。');
    } else {
        const color = currentColor.value || 'blue';
        if (f7.colors[color]) {
            f7.setColorTheme(f7.colors[color]);
        }
    }
    saveThemeSettings();
};

const setDarkMode = (checked) => {
    isDarkMode.value = checked;
    if (isFollowSystem.value && !checked) {
        isFollowSystem.value = false;
    }
    f7.setDarkMode(checked);
    saveThemeSettings();
};

const setFollowSystem = (checked) => {
    isFollowSystem.value = checked;
    if (checked) {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const isSystemDark = mq.matches;
        if (isDarkMode.value !== isSystemDark) {
            f7.setDarkMode(isSystemDark);
        }
    } else {
        isDarkMode.value = false;
        f7.setDarkMode(false);
    }
    saveThemeSettings();
};

const updateMdScheme = () => {
    let scheme = 'default';
    if (isMonochrome.value && isVibrant.value) scheme = 'monochrome-vibrant';
    else if (isMonochrome.value) scheme = 'monochrome';
    else if (isVibrant.value) scheme = 'vibrant';

    f7.setMdColorScheme(scheme);
    saveThemeSettings();
};

const fontSizes = [
    { label: '小', value: '14px' },
    { label: '标准', value: '16px' },
    { label: '大', value: '18px' },
    { label: '特大', value: '20px' }
];
const currentFontSize = ref('16px');

const setFontSize = (size) => {
    currentFontSize.value = size;
    document.documentElement.style.setProperty('--f7-font-size', size);
    saveThemeSettings();
};

const saveThemeSettings = () => {
    const config = {
        color: currentColor.value,
        customColor: customColor.value,
        useCustomColor: isCustomColorEnabled.value,
        fontSize: currentFontSize.value,
        darkMode: isDarkMode.value,
        followSystem: isFollowSystem.value,
        monochrome: isMonochrome.value,
        monochrome: isMonochrome.value,
        vibrant: isVibrant.value
    };
    localStorage.setItem('theme_config', JSON.stringify(config));
};

const loadThemeSettings = () => {
    try {
        const stored = localStorage.getItem('theme_config');
        if (stored) {
            const config = JSON.parse(stored);

            if (config.darkMode !== undefined) {
                isDarkMode.value = config.darkMode;
            }

            if (config.followSystem !== undefined) {
                isFollowSystem.value = config.followSystem;
            }

            if (config.fontSize) {
                currentFontSize.value = config.fontSize;
            }

            if (config.useCustomColor !== undefined) {
                isCustomColorEnabled.value = config.useCustomColor;
            }

            if (config.customColor) {
                customColor.value = config.customColor;
            }

            if (config.color && f7.colors[config.color]) {
                currentColor.value = config.color;
            }

            if (config.monochrome !== undefined) isMonochrome.value = config.monochrome;
            if (config.vibrant !== undefined) isVibrant.value = config.vibrant;

            let scheme = 'default';
            if (isMonochrome.value && isVibrant.value) scheme = 'monochrome-vibrant';
            else if (isMonochrome.value) scheme = 'monochrome';
            else if (isVibrant.value) scheme = 'vibrant';
        }
    } catch (e) {
        console.error('Failed to load theme settings', e);
    }
};

const showMsidTutorial = ref(false);

const openMsidTutorial = () => {
    showMsidTutorial.value = true;
};

const setMsid = () => {
    f7.dialog.prompt('请输入数盟ID (留空则使用默认)', '设置数盟ID', (value) => {
        if (!value) {
            localStorage.removeItem('zhihu_msid');
            f7.toast.show({ text: '已恢复默认ID', closeTimeout: 2000 });
        } else {
            localStorage.setItem('zhihu_msid', value);
            f7.toast.show({ text: '设置成功', closeTimeout: 2000 });
        }
    }, () => { }, localStorage.getItem('zhihu_msid') || '');
};

loadThemeSettings();
</script>

<template>
    <f7-page name="settings">
        <f7-navbar title="设置" back-link="返回"></f7-navbar>

        <f7-block-title>首页设置</f7-block-title>
        <f7-list strong inset>
            <f7-list-item title="修改主页推荐地点" link="#" @click="openCitySettings">
            </f7-list-item>
            <f7-list-item title="主页标签管理" link="#" @click="openTabsSettings">
                <template #after>
                    <span>{{ enabledTabs.length }} 个启用</span>
                </template>
            </f7-list-item>
            <f7-list-item title="关注页默认标签" smart-select :smart-select-params="{ openIn: 'sheet' }">
                <select v-model="defaultFollowingTab">
                    <option v-for="opt in followingCheckOptions" :key="opt.value" :value="opt.value">{{ opt.label }}
                    </option>
                </select>
            </f7-list-item>
        </f7-list>

        <f7-block-title>外观</f7-block-title>
        <f7-block strong inset>
            <p>主题色</p>
            <div class="color-theme-container">
                <f7-button v-for="color in colors" :key="color" fill round small class="color-picker-button"
                    :class="`color-${color}`" @click="setColorTheme(color)"
                    :style="{ opacity: isCustomColorEnabled ? 0.4 : 1 }">
                    <f7-icon f7="checkmark_alt" size="16" color="white" v-if="currentColor === color" />
                </f7-button>
            </div>
            <div class="display-flex justify-content-space-between align-items-center margin-top">
                <span>使用自定义主题色</span>
                <f7-toggle :checked="isCustomColorEnabled" @change="toggleCustomColor($event.target.checked)" />
            </div>

            <div v-if="isCustomColorEnabled" class="display-flex align-items-center margin-top-half">
                <div class="custom-color-picker-target margin-right"
                    style="width: 28px; height: 28px; border-radius: 4px; border: 1px solid #ccc; flex-shrink: 0;"
                    :style="{ backgroundColor: customColorPickerValue.hex || '#007aff' }">
                </div>
                <f7-input type="colorpicker" placeholder="点击选择颜色" readonly :color-picker-params="{
                    modules: ['sb-spectrum', 'hsb-sliders', 'alpha-slider'],
                    targetEl: '.custom-color-picker-target'
                }" v-model:value="customColorPickerValue" />
            </div>


            <p class="margin-top">字号大小</p>
            <div class="segmented segmented-round">
                <f7-button v-for="size in fontSizes" :key="size.value" :active="currentFontSize === size.value"
                    @click="setFontSize(size.value)" small outline>
                    {{ size.label }}
                </f7-button>
            </div>
        </f7-block>

        <f7-list strong inset>
            <f7-list-item title="跟随系统">
                <template #after>
                    <f7-toggle :checked="isFollowSystem" @change="setFollowSystem($event.target.checked)" />
                </template>
            </f7-list-item>
            <f7-list-item title="深色模式" :disabled="isFollowSystem">
                <template #after>
                    <f7-toggle :checked="isDarkMode" @change="setDarkMode($event.target.checked)"
                        :disabled="isFollowSystem" />
                </template>
            </f7-list-item>
        </f7-list>

        <f7-block-title v-if="f7.theme === 'md'">Material 风格设置</f7-block-title>
        <f7-list strong inset v-if="f7.theme === 'md'">
            <f7-list-item title="单色模式">
                <template #after>
                    <f7-toggle :checked="isMonochrome"
                        @change="(e) => { isMonochrome = e.target.checked; updateMdScheme(); }" />
                </template>
            </f7-list-item>
            <f7-list-item title="充满活力 (Vibrant)">
                <template #after>
                    <f7-toggle :checked="isVibrant"
                        @change="(e) => { isVibrant = e.target.checked; updateMdScheme(); }" />
                </template>
            </f7-list-item>
        </f7-list>

        <f7-block-title>高级设置</f7-block-title>
        <f7-list strong inset>
            <f7-list-item title="数盟ID获取教程" link="#" @click="openMsidTutorial"></f7-list-item>
            <f7-list-item title="设置数盟ID" link="#" @click="setMsid"></f7-list-item>
        </f7-list>

        <f7-block-title>关于</f7-block-title>
        <f7-list strong inset>
            <f7-list-item @click="$openLink('https://zhihulite.github.io/')" title="关于"
              :after="`构造日期 ${buildTime || '开发版'}`"></f7-list-item>
            <f7-list-item title="检测更新" link="#" @click="checkForUpdate">
              <template #after>
                <span v-if="appVersion">版本代号 {{ appVersion }}</span>
              </template>
            </f7-list-item>
        </f7-list>

        <f7-popup :opened="showCityDialog" class="city-popup" @popup:closed="handleClose" swipe-to-close>
            <f7-page>
                <f7-navbar title="修改城市">
                    <f7-nav-right>
                        <f7-link @click="handleClose">取消</f7-link>
                    </f7-nav-right>
                </f7-navbar>
                <f7-block>
                    <div class="dialog-input-container">
                        <p class="no-margin-top margin-bottom-half text-color-gray">请输入城市名称（如：北京）</p>
                        <f7-input type="text" placeholder="输入城市名称" v-model:value="cityInput" clear-button
                            class="city-input margin-bottom" />
                        <f7-button fill large @click="saveCity" :loading="isSubmitting"
                            class="margin-bottom">确定</f7-button>

                        <div class="block-title margin-top">支持的城市列表</div>
                        <div class="city-list-scroll">
                            <div class="city-list-text">{{ cityListContent }}</div>
                        </div>
                    </div>
                </f7-block>
            </f7-page>
        </f7-popup>

        <f7-popup :opened="showTabsPopup" class="tabs-popup" @popup:closed="showTabsPopup = false">
            <f7-page>
                <f7-navbar title="主页标签管理">
                    <f7-nav-right>
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
                    <p>如果是root 就不用这一步 直接打开mt管理器 输入su后将上述指令的 top.bienvenido.saas.i18n/app_data_anon/ 替换为空 执行即可得到参数</p>
                    <p>将输出文本复制粘贴到这里即可</p>
                    <p>或者去github.com或其他途径搜索 x-ms-id 将他的输出参数复制即可 留空则为使用默认ms-id</p>
                </f7-block>
            </f7-page>
        </f7-popup>
    </f7-page>
</template>

<style scoped>
.city-list-scroll {
    height: 300px;
    overflow-y: auto;
    background: #f5f5f5;
    padding: 10px;
    border-radius: 8px;
    margin-top: 10px;
}

.city-list-text {
    white-space: pre-wrap;
    font-size: 13px;
    color: #666;
    line-height: 1.5;
}

.city-input {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 8px;
    width: 100%;
    box-sizing: border-box;
}

.dialog-buttons {
    display: flex;
    justify-content: flex-end;
    padding: 10px;
    gap: 10px;
}

.dialog-button {
    width: auto;
    min-width: 60px;
}

.color-picker-button {
    height: 32px;
    width: 32px;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: unset;
}

.color-theme-container {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 16px;
    padding: 10px 0;
}
</style>
