// src/services/update.js
// 版本检查：对比 version.json 与本地记录，供设置页手动检测与启动期自动检测共用。
import { f7 } from 'framework7-vue';
import { destroyOnClosed } from '@/utils/modal.js';
import { settings } from '@/core/settings.js';
import { KEYS, getString, setString } from '@/services/storage.js';

const basePath = window.location.pathname.endsWith('/')
    ? window.location.pathname
    : window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);

export function localVersion() {
    return getString(KEYS.appVersion) || '';
}

let versionInfo = null;

/** 读取部署版本信息（version.json），同一次运行内复用 */
export async function getVersionInfo({ force = false } = {}) {
    if (force || !versionInfo) {
        const res = await fetch(`${basePath}version.json?ts=${Date.now()}`, { cache: 'no-cache' });
        if (!res.ok) throw new Error('读取版本配置失败');
        const cfg = await res.json();
        versionInfo = { version: String(cfg.version || ''), builtAt: cfg.builtAt || '' };
    }
    return versionInfo;
}

/** 启动时把当前部署版本记为「本地版本」，之后的比对才有基准 */
export async function syncVersionInfo() {
    try {
        const info = await getVersionInfo();
        if (info.version) setString(KEYS.appVersion, info.version);
        return info;
    } catch (e) {
        return null;
    }
}

/**
 * 检测更新。
 * @param {{silent?: boolean}} options silent=true 时仅在有新版本才提示（用于启动期自动检测）
 * @returns {Promise<'latest'|'updated'|'ignored'|'error'>}
 */
export async function checkUpdate({ silent = false } = {}) {
    if (process.env.NODE_ENV !== 'production') {
        if (!silent) f7.toast.show({ text: '开发版不支持检查更新' });
        return 'error';
    }

    if (!silent) f7.preloader.show();
    try {
        const remote = await getVersionInfo({ force: true });
        const local = localVersion();

        if (!remote.version || remote.version === local) {
            if (!silent) f7.toast.show({ text: '当前已是最新版本' });
            return 'latest';
        }
        // 自动检测时尊重「忽略此版本」
        if (silent && settings.ignoredVersion === remote.version) return 'ignored';

        return await new Promise((resolve) => {
            const dialog = f7.dialog.create({
                title: '发现新版本',
                text: remote.builtAt ? `构建时间 ${new Date(remote.builtAt).toLocaleString('zh-CN')}` : '',
                buttons: [
                    {
                        text: '忽略此版本',
                        onClick: () => {
                            settings.ignoredVersion = remote.version;
                            resolve('ignored');
                        },
                    },
                    {
                        text: '更新',
                        bold: true,
                        onClick: async () => {
                            if (f7.serviceWorker?.update) await f7.serviceWorker.update();
                            setString(KEYS.appVersion, remote.version);
                            window.location.reload();
                            resolve('updated');
                        },
                    },
                ],
            });
            destroyOnClosed(dialog).open();
        });
    } catch (e) {
        if (!silent) f7.toast.show({ text: '检测更新失败' });
        return 'error';
    } finally {
        if (!silent) f7.preloader.hide();
    }
}
