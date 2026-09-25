import CryptoJS from 'crypto-js';
import $http from '@/services/http.js';
import { KEYS, getJSON, setJSON, removeKeys } from '@/services/storage.js';

const CLIENT_ID = '8d5227e0aaaa4797a763ac64e0c3b8';
const CLIENT_SECRET = 'ecbefbf6b17e47ecb9035107866380';
const SOURCE = 'com.zhihu.android';

// Token 存储变量
let accessToken = null;
let refreshToken = null;
let expiresAt = null;
let updateTime = null;
let isGuest = false;
let loginData = null;

// 加载本地存储的 token
function loadTokens() {
    const data = getJSON(KEYS.auth, null);
    if (!data) return;
    try {
        accessToken = data.accessToken;
        refreshToken = data.refreshToken;
        expiresAt = data.expiresAt;
        updateTime = data.updateTime;
        isGuest = data.isGuest || false;
        loginData = data.loginData ? JSON.parse(data.loginData) : null;
    } catch (e) {
        console.error('Failed to load tokens:', e);
    }
}

// 保存 token 到本地存储
function saveTokens(newAccessToken, newRefreshToken, expiresIn, guest = false, login = null) {
    accessToken = newAccessToken;
    refreshToken = newRefreshToken;
    if (expiresIn) {
        expiresAt = Date.now() + expiresIn * 1000;
        updateTime = Date.now() + (expiresIn * 1000 * 0.7); // 70% of expiry time
    }
    isGuest = guest;
    loginData = login;

    setJSON(KEYS.auth, {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt: expiresAt,
        updateTime: updateTime,
        isGuest: guest,
        loginData: login ? JSON.stringify(login) : null,
    });
}

// 清除所有 token
function clearTokens() {
    accessToken = null;
    refreshToken = null;
    expiresAt = null;
    updateTime = null;
    isGuest = false;
    loginData = null;
    removeKeys(KEYS.auth, KEYS.udid, KEYS.zsts);
}

// 检查是否需要刷新 token
function shouldRefresh() {
    if (isGuest) return false;
    return updateTime && Date.now() >= updateTime;
}

// 检查是否已登录
function isLogin() {
    return (accessToken !== null && isGuest !== true);
}

// 令牌是否已到期（游客令牌没有 refresh_token，到期只能重新引导）
function isExpired() {
    return !!expiresAt && Date.now() >= expiresAt;
}

// Token 管理器函数
const tokenManager = {
    getAccessToken: () => accessToken,
    getRefreshToken: () => refreshToken,
    getLoginData: () => loginData,
    get isGuest() {
        return isGuest;
    },
    isLogin: () => isLogin(),
    isExpired: () => isExpired(),
    shouldRefresh: () => shouldRefresh(),
    saveTokens,
    clear: clearTokens,
};

// 初始化时加载 token
loadTokens();

// 生成签名
function generateSignature(grantType, timestamp) {
    const message = `${grantType}${CLIENT_ID}${SOURCE}${timestamp}`;
    const hash = CryptoJS.HmacSHA1(message, CLIENT_SECRET);
    return hash.toString(CryptoJS.enc.Hex);
}

// 获取当前时间戳（秒）
function getTimestamp() {
    return Math.floor(Date.now() / 1000);
}

// 获取验证码
export async function getCaptcha() {
    const response = await $http.get('https://api.zhihu.com/captcha');
    return response;
}

// 获取验证码图片（返回base64）
export async function getCaptchaImage(captchaTicket) {
    try {
        const response = await $http.put('https://api.zhihu.com/captcha', null, {
            headers: {
                'Cookie': `capsion_ticket=${captchaTicket}`
            }
        });

        const imgBase64 = response.img_base64;
        return `data:image/jpeg;base64,${imgBase64}`;
    } catch (e) {
        console.error('Failed to get captcha image:', e);
        throw e;
    }
}

// 提交验证码 暂不需要加密body
export async function submitCaptcha(inputText, captchaTicket) {
    const body = `input_text=${encodeURIComponent(inputText)}`;

    const response = await $http.post('https://api.zhihu.com/captcha', body, {
        headers: {
            'Cookie': `capsion_ticket=${captchaTicket}`,
        },
        encryptBody: false
    });

    return response;
}

// 密码登录
export async function loginWithPassword(phone, password, captchaTicket = '') {
    const timestamp = getTimestamp();
    const grantType = 'password';
    const signature = generateSignature(grantType, timestamp);

    const body = new URLSearchParams({
        password,
        grant_type: grantType,
        signature,
        source: SOURCE,
        client_id: CLIENT_ID,
        timestamp: timestamp.toString(),
        username: `+86${phone}`
    }).toString();

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    if (captchaTicket) {
        headers['Cookie'] = `capsion_ticket=${captchaTicket}`;
    }

    const data = await $http.post('https://api.zhihu.com/api/account/prod/sign_in', body, { headers, noCredentialRebuild: true });

    if (data.access_token) {
        tokenManager.saveTokens(
            data.access_token,
            data.refresh_token,
            data.expires_in,
            false,
            data
        );
    }

    return data;
}

// 验证码登录
export async function loginWithCode(phone, code, captchaTicket = '') {
    const timestamp = getTimestamp();
    const grantType = 'digits';
    const signature = generateSignature(grantType, timestamp);

    const body = new URLSearchParams({
        app_scene: 'verification_regist',
        grant_type: grantType,
        signature,
        digits: code,
        source: SOURCE,
        client_id: CLIENT_ID,
        timestamp: timestamp.toString(),
        username: `+86${phone}`
    }).toString();

    const headers = {};

    if (captchaTicket) {
        headers['Cookie'] = `capsion_ticket=${captchaTicket}`;
    }

    const data = await $http.post('https://api.zhihu.com/api/account/prod/sign_in', body, { headers, noCredentialRebuild: true });

    if (data.access_token) {
        tokenManager.saveTokens(
            data.access_token,
            data.refresh_token,
            data.expires_in,
            false,
            data
        );
    }

    return data;
}

// 刷新Token
export async function refreshAccessToken() {
    const currentRefreshToken = tokenManager.getRefreshToken();
    if (!currentRefreshToken) {
        throw new Error('No refresh token available');
    }

    const timestamp = getTimestamp();
    const grantType = 'refresh_token';
    const signature = generateSignature(grantType, timestamp);

    const body = new URLSearchParams({
        refresh_token: currentRefreshToken,
        grant_type: grantType,
        signature,
        source: SOURCE,
        client_id: CLIENT_ID,
        timestamp: timestamp.toString()
    }).toString();

    const data = await $http.post('https://api.zhihu.com/api/account/prod/sign_in', body,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            noCredentialRebuild: true,
        });

    if (data.access_token) {
        tokenManager.saveTokens(
            data.access_token,
            data.refresh_token,
            data.expires_in,
            isGuest,
            data
        );
        // 请求实例持有的是装配时的一次性头快照，令牌换了必须回写，否则后续请求仍带旧令牌。
        // 此处动态 import：module.js 静态依赖本文件，直接 import 会成环。
        const { updateZhihuLoginData } = await import('@/services/zhihu/module.js');
        updateZhihuLoginData(tokenManager.getLoginData());
    }

    return data;
}

// 发送短信验证码
export async function sendSmsCode(phone, captchaTicket) {
    const body = new URLSearchParams({
        username: `+86${phone}`,
        client_id: CLIENT_ID
    }).toString();

    const headers = {};

    if (captchaTicket) {
        headers['Cookie'] = `capsion_ticket=${captchaTicket}`;
    }

    const response = await $http.post('https://api.zhihu.com/api/account/prod/auth/digits', body,
        {
            headers: headers
        });
    return response;
}

// 登出
export async function logout() {
    const currentAccessToken = tokenManager.getAccessToken();
    const body = new URLSearchParams({
        token: currentAccessToken,
        use_refresh_direct_sign: '0'
    }).toString();

    let response = null;
    try {
        response = await $http.post('https://api.zhihu.com/api/account/prod/client_logout', body,
            {
                headers: {}
            });
    } catch (e) {
        console.error('服务端登出失败', e);
    } finally {
        // 服务端成败都不影响本地清理，否则本地一直以为自己还登录着
        tokenManager.clear();
    }

    const { getZhihuInstance, initZhihu } = await import('@/services/zhihu/module.js');
    // 实例持的是登出前的凭证：服务端登出可能因断网没打成，不停用就等于退出后继续用刚退掉的会话。
    // 停用后请求不带凭证必被判 401，由 401 分支重新引导游客，不依赖这一次重建是否成功
    getZhihuInstance()?.updateLoginData(null);
    try {
        await initZhihu();
    } catch (e) {
        console.error('登出后请求栈重建失败', e);
    }
    return response;
}

// 尝试刷新 token
export async function tryRefreshToken(forceRefresh = false) {
    if (tokenManager.shouldRefresh() || forceRefresh) {
        try {
            await refreshAccessToken();
        } catch (e) {
            console.error('Failed to refresh token:', e);
            // 只有服务端明确拒绝才作废凭证；网络抖动、超时留着还能用的旧令牌
            if (e?.status >= 400 && e?.status < 500) tokenManager.clear();
        }
    }
}

// 凭证重建单点：并发请求共用同一次重建，避免各自刷新的批次互相抹掉新令牌
let credentialJob = null;

export function rebuildCredential() {
    if (!credentialJob) {
        credentialJob = (async () => {
            if (isLogin()) {
                await tryRefreshToken(true);
                return;
            }
            const { ensureGuestCredential } = await import('@/services/zhihu/guest.js');
            await ensureGuestCredential(true);
        })().finally(() => { credentialJob = null; });
    }
    return credentialJob;
}

// 导出 tokenManager
export { tokenManager };
