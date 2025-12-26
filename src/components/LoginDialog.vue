<script setup>
import { ref, watch, onUnmounted } from 'vue';

import {
    tokenManager,
    getCaptcha,
    getCaptchaImage,
    submitCaptcha,
    loginWithPassword,
    loginWithCode,
    sendSmsCode,
} from '../api/auth.js';
import { updateZhihuLoginData } from '../api/utils/zhihu-module.js';

const props = defineProps({
    modelValue: Boolean
});

const emit = defineEmits(['update:modelValue', 'login-success']);

const loginMethod = ref('password');
const action = ref('login'); // 'login' | 'send-sms'
const phone = ref('');
const password = ref('');
const smsCode = ref('');
const captchaInput = ref('');
const loading = ref(false);
const error = ref('');
const countdown = ref(0);

const showCaptcha = ref(false);
const captchaTicket = ref(null);
const captchaImageUrl = ref('');

const countdownTimer = ref(null);
const allowClose = ref(false);

const extractCapsionTicketFromResponse = (response) => {
    const cookie = response?.cookie || '';
    const match = cookie.match(/capsion_ticket=([^;\s]+)/);
    return match ? decodeURIComponent(match[1]) : null;
};

const setError = (msg) => {
    error.value = msg;
};

const clearError = () => {
    error.value = '';
};

const close = () => {
    if (!props.modelValue) return;
    allowClose.value = true;
    emit('update:modelValue', false);
};

const resetForm = () => {
    action.value = 'login';
    phone.value = '';
    password.value = '';
    smsCode.value = '';
    captchaInput.value = '';
    error.value = '';
    showCaptcha.value = false;
    captchaTicket.value = null;
    captchaImageUrl.value = '';
    if (countdownTimer.value) {
        clearInterval(countdownTimer.value);
        countdownTimer.value = null;
        countdown.value = 0;
    }
};

const checkCaptcha = async () => {
    try {
        captchaInput.value = '';
        clearError();
        const response = await getCaptcha();
        const ticket = extractCapsionTicketFromResponse(response);
        captchaTicket.value = ticket;

        if (response.show_captcha) {
            if (!ticket) {
                setError('验证码服务异常，请稍后重试');
                return { canProceed: false };
            }
            captchaImageUrl.value = await getCaptchaImage(ticket);
            showCaptcha.value = true;
            return { canProceed: false };
        }
        return { canProceed: true };
    } catch (e) {
        console.error('Check captcha failed:', e);
        setError('验证码服务异常，请稍后重试');
        return { canProceed: false };
    }
};

const handleCaptchaSubmit = async () => {
    if (!captchaInput.value) {
        setError('请输入验证码');
        return;
    }
    if (!captchaTicket.value) {
        setError('验证码无效，请刷新重试');
        return;
    }

    try {
        loading.value = true;
        clearError();
        // action.value is maintained across captcha
        await submitCaptcha(captchaInput.value, captchaTicket.value);
        showCaptcha.value = false;
        captchaImageUrl.value = '';

        // 根据action状态决定后续操作
        if (action.value === 'send-sms') {
            await performSend();
        } else {
            await performLogin();
        }
    } catch (e) {
        setError('验证码错误，请重试');
        if (captchaTicket.value) {
            captchaImageUrl.value = await getCaptchaImage(captchaTicket.value);
        }
    } finally {
        loading.value = false;
    }
};

const isValidPhone = (str) => {
    const reg = /^1[3-9]\d{9}$/;
    return reg.test(str);
};

const performLogin = async () => {
    try {
        loading.value = true;
        clearError();

        let response;
        if (loginMethod.value === 'password') {
            response = await loginWithPassword(phone.value, password.value, captchaTicket.value);
        } else {
            response = await loginWithCode(phone.value, smsCode.value, captchaTicket.value);
        }

        if (response?.error) {
            setError(response.error.message || '登录失败');
            return;
        }

        const loginData = tokenManager.getLoginData();
        updateZhihuLoginData(loginData);
        emit('login-success');
        close();
    } catch (e) {
        console.error('Login failed:', e);
        setError(e.message || '登录失败，请重试');
    } finally {
        loading.value = false;
    }
};

const handleLogin = async () => {
    action.value = 'login';
    if (!phone.value) return setError('请输入手机号');
    if (!isValidPhone(phone.value)) return setError('手机号格式不正确');

    // 如果是密码登录，需要密码
    if (loginMethod.value === 'password' && !password.value) return setError('请输入密码');

    // 如果是验证码登录且action是login，需要验证码
    if (loginMethod.value === 'code' && action.value === 'login' && !smsCode.value) {
        return setError('请输入验证码');
    }

    const { canProceed } = await checkCaptcha();
    if (!canProceed) return;
    await performLogin();
};

const startCountdown = () => {
    if (countdownTimer.value) clearInterval(countdownTimer.value);
    countdown.value = 60;
    countdownTimer.value = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
            clearInterval(countdownTimer.value);
            countdownTimer.value = null;
        }
    }, 1000);
};

const performSend = async () => {
    try {
        loading.value = true;
        clearError();
        smsCode.value = '';
        await sendSmsCode(phone.value, captchaTicket.value);
        startCountdown();
    } catch (e) {
        console.error('Send SMS failed:', e);
        setError('发送验证码失败');
    } finally {
        loading.value = false;
        // Reset action to login so next button click attempts to login
        action.value = 'login'
    }
};

const handleSendCode = async () => {
    if (countdown.value > 0) return;
    if (!phone.value) return setError('请输入手机号');
    if (!isValidPhone(phone.value)) return setError('手机号格式不正确');

    action.value = 'send-sms'
    const { canProceed } = await checkCaptcha();
    if (!canProceed) return;

    await performSend();
};

const switchMethod = () => {
    loginMethod.value = loginMethod.value === 'password' ? 'code' : 'password';
    error.value = '';
};

const handleDialogClose = (e) => {
    // F7 popup closed
    emit('update:modelValue', false);
};

const handleCancel = () => {
    close();
};

const onDialogClosed = () => {
    resetForm();
    allowClose.value = false;
    emit('update:modelValue', false);
};

watch(smsCode, (val) => {
    if (val && val.length > 6) smsCode.value = val.slice(0, 6);
});

watch(captchaInput, (val) => {
    if (val && val.length > 4) captchaInput.value = val.slice(0, 4);
});

onUnmounted(() => {
    if (countdownTimer.value) {
        clearInterval(countdownTimer.value);
        countdownTimer.value = null;
    }
});
</script>

<template>
    <f7-popup class="login-popup" :opened="modelValue" @popup:closed="onDialogClosed" swipe-to-close>
        <f7-page login-screen>
            <f7-navbar>
                <f7-nav-left>
                    <f7-link icon-only @click="handleCancel">
                        <f7-icon ios="f7:multiply" md="material:close" />
                    </f7-link>
                </f7-nav-left>
                <f7-nav-title>{{ showCaptcha ? '验证' : '登录' }}</f7-nav-title>
            </f7-navbar>

            <f7-page-content>
                <div v-if="showCaptcha" class="padding">
                    <div class="captcha-img-wrapper text-align-center margin-bottom">
                        <img :src="captchaImageUrl" class="captcha-image" alt="验证码" />
                    </div>
                    <f7-list>
                        <f7-list-input label="请输入图中验证码" type="text" placeholder="4位验证码" v-model:value="captchaInput"
                            clear-button />
                    </f7-list>
                    <f7-block v-if="!captchaTicket" class="text-color-red">
                        <f7-icon ios="f7:exclamationmark_circle_fill" md="material:error" size="16" />
                        验证码加载失败，请重试
                    </f7-block>
                    <f7-block>
                        <f7-button fill large @click="handleCaptchaSubmit" :loading="loading">确认</f7-button>
                    </f7-block>
                </div>

                <div v-else class="login-form-wrapper">
                    <f7-list form>
                        <f7-list-input label="手机号" type="tel" placeholder="请输入手机号" v-model:value="phone" clear-button />

                        <f7-list-input v-if="loginMethod === 'password'" label="密码" type="password" placeholder="请输入密码"
                            v-model:value="password" clear-button />

                        <f7-list-input v-else label="验证码" type="text" placeholder="短信验证码" v-model:value="smsCode">
                            <template #content-end>
                                <f7-button small outline @click="handleSendCode" :disabled="countdown > 0 || loading"
                                    style="width: 100px; margin: 10px;">
                                    {{ countdown > 0 ? `${countdown}s` : '发送' }}
                                </f7-button>
                            </template>
                        </f7-list-input>
                    </f7-list>

                    <f7-block>
                        <f7-button fill large @click="handleLogin" :loading="loading">登录</f7-button>
                        <div class="margin-top text-align-center">
                            <f7-button @click="switchMethod">{{ loginMethod === 'password' ? '验证码登录' : '密码登录'
                                }}</f7-button>
                        </div>
                    </f7-block>

                    <f7-block v-if="error"
                        class="text-color-red text-align-center display-flex justify-content-center align-items-center"
                        style="gap:8px;">
                        <f7-icon ios="f7:exclamationmark_circle_fill" md="material:error" size="16" /> {{ error }}
                    </f7-block>
                </div>
            </f7-page-content>
        </f7-page>
    </f7-popup>
</template>

<style scoped>
.captcha-image {
    width: 100%;
    max-width: 300px;
    height: auto;
    border-radius: 8px;
    border: 1px solid var(--f7-list-item-border-color);
}
</style>