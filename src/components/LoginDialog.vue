<script setup>
import { ref, watch, onUnmounted } from 'vue';
import MaterialSymbol from './MaterialSymbol.vue';
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
    if (!allowClose.value) {
        e.preventDefault();
        return;
    }
    allowClose.value = false;
};

const handleCancel = () => {
    close();
};

const onDialogClosed = () => {
    resetForm();
    allowClose.value = false;
};

watch(smsCode, (val) => {
    if (val.length > 4) smsCode.value = val.slice(0, 6);
});

watch(captchaInput, (val) => {
    if (val.length > 4) captchaInput.value = val.slice(0, 4);
});

onUnmounted(() => {
    if (countdownTimer.value) {
        clearInterval(countdownTimer.value);
        countdownTimer.value = null;
    }
});
</script>

<template>
    <s-dialog ref="dialogRef" :showed="modelValue" @close="handleDialogClose" @closed="onDialogClosed">
        <div slot="headline">{{ showCaptcha ? '验证' : '登录' }}</div>

        <div slot="text">
            <div v-if="showCaptcha" class="captcha-container">
                <img :src="captchaImageUrl" class="captcha-image" alt="验证码" />
                <s-text-field v-model="captchaInput" label="请输入图中验证码" class="input-field"
                    :disabled="!captchaTicket"></s-text-field>
                <div v-if="!captchaTicket" class="error-message">
                    <MaterialSymbol icon="error" :size="16" />
                    验证码加载失败，请重试
                </div>
            </div>

            <div v-else class="login-form">
                <s-text-field v-model="phone" label="手机号" type="tel" inputmode="numeric"
                    class="input-field"></s-text-field>

                <s-text-field v-if="loginMethod === 'password'" v-model="password" label="密码" type="password"
                    class="input-field"></s-text-field>

                <div v-else class="code-input-group">
                    <s-text-field v-model="smsCode" label="验证码" inputmode="numeric"
                        class="input-field code-field"></s-text-field>
                    <s-button type="outlined" @click="handleSendCode" :disabled="countdown > 0 || loading"
                        class="send-code-btn">
                        {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
                    </s-button>
                </div>

                <s-button type="text" @click="switchMethod" class="switch-btn">
                    {{ loginMethod === 'password' ? '验证码登录' : '密码登录' }}
                </s-button>
            </div>

            <div v-if="error && !showCaptcha" class="error-message">
                <MaterialSymbol icon="error" :size="16" />
                {{ error }}
            </div>
        </div>

        <s-button slot="action" type="text" @click="handleCancel">取消</s-button>
        <s-button slot="action" type="text" @click="showCaptcha ? handleCaptchaSubmit() : handleLogin()"
            :disabled="loading">
            {{ loading ? '处理中...' : (showCaptcha ? '确认' : '登录') }}
        </s-button>
    </s-dialog>
</template>

<style scoped>
.login-form,
.captcha-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 8px 0;
}

.input-field {
    width: 100%;
}

.code-input-group {
    display: flex;
    gap: 8px;
    align-items: flex-end;
}

.code-field {
    flex: 1;
}

.send-code-btn {
    flex-shrink: 0;
    height: 40px;
}

.error-message {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--md-sys-color-error);
    font-size: 0.875rem;
    padding: 8px;
    background-color: var(--md-sys-color-error-container);
    border-radius: 8px;
}

.switch-btn {
    align-self: flex-start;
    margin-top: 8px;
}

.captcha-image {
    width: 100%;
    max-width: 300px;
    height: auto;
    border-radius: 8px;
    border: 1px solid var(--md-sys-color-outline-variant);
}
</style>