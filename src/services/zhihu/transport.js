import { f7 } from 'framework7-vue';
import { rebuildCredential, tokenManager } from '@/services/auth.js';

// HTTP 状态码 → 用户文案
const HTTP_MESSAGES = {
    400: '请求参数错误',
    401: '未授权，请重新登录',
    403: '权限不足',
    404: '请求的资源不存在',
};

export function describeHttpStatus(code) {
    if (code < 0) return `网络请求失败 (${code})`;
    if (HTTP_MESSAGES[code]) return HTTP_MESSAGES[code];
    return code >= 500 ? '服务器错误' : `请求失败 (${code})`;
}

// 安全验证闩：命中跳转后置位，请求全线暂停直到刷新页面；提示按 5 秒节流
let blockedUntilRefresh = false;
let blockedTipAt = 0;

// 凭证失效提示闩：并发请求共用一次重建与一条提示，确认重建后释放
let authLostNotified = false;

// GM 既不回调 onload 也不回调 onerror 时 Promise 永不 settle，列表会一直转圈
const REQUEST_TIMEOUT_MS = 30000;

function rawUnifiedFetch(url, options = {}) {
	return new Promise((resolve, reject) => {
		const method = (options.method || 'GET').toUpperCase();
		const headers = options.headers || {};
		const body = options.body;
		const isGet = method === 'GET' || method === 'HEAD';
		const requestData = isGet ? null : body;
		const signal = options.signal;
		let gmHandle = null;

		// AbortSignal 透传：signal 触发时调 GM 请求句柄的 abort
		if (signal) {
			if (signal.aborted) {
				reject(new DOMException('Aborted', 'AbortError'));
				return;
			}
			signal.addEventListener('abort', () => {
				try { gmHandle?.abort(); } catch (e) { /* 已完成无需取消 */ }
				reject(new DOMException('Aborted', 'AbortError'));
			}, { once: true });
		}

		// 处理Cookie和cookie的赋值
		const customCookie = headers.Cookie || headers.cookie;
		if (customCookie !== undefined) {
			delete headers.Cookie;
			delete headers.cookie;
		}

		const gmOptions = {
			method: method,
			url: url,
			headers: headers,
			onload: (response) => {
				console.log(`[request] ${method} ${url}`);
				const code = response.status;
				const responseText = response.responseText;
				const responseHeaders = response.responseHeaders;

				const headers = new Headers();
				responseHeaders.split('\n').forEach(line => {
					if (!line.includes(':')) return;

					const colonIndex = line.indexOf(':');
					const key = line.slice(0, colonIndex).trim();
					const value = line.slice(colonIndex + 1).trim();

					headers.append(key, value);
				});

				const result = new Response(responseText, {
					status: code,
					headers
				});

				resolve(result);
			},
			onerror: (error) => {
				console.error(`[request] ${method} ${url} failed:`, error);
				reject(new Error('网络请求失败，请检查网络后重试'));
			},
			ontimeout: () => {
				console.error(`[request] ${method} ${url} timeout`);
				reject(new Error('请求超时，请检查网络后重试'));
			}
		};

		gmOptions.timeout = options.timeout ?? REQUEST_TIMEOUT_MS;

		if (requestData !== null) {
			gmOptions.data = requestData;
		}

		if (customCookie !== undefined) {
			gmOptions.anonymous = true
			gmOptions.cookie = customCookie;
		}

		gmHandle = GM_xmlhttpRequest(gmOptions);
	});
}


function addMethods(fn) {
	const parseWithBigInt = (jsonString) => {
		try {
			return JSON.parse(jsonString, (key, value, ctx) => {
				if (ctx && typeof value === 'number' && value > Number.MAX_SAFE_INTEGER) {
					return ctx.source;
				}
				return value;
			});
		} catch {
			return null;
		}
	};

	const handleResponse = async (res) => {
		try {
			const text = await res.text();
			const contentType = res.headers.get('content-type');

			if (!contentType?.includes('application/json') || res.status === 204) {
				return res;
			}

			const parsed = parseWithBigInt(text);
			return parsed !== null ? parsed : res;
		} catch {
			return res;
		}
	};

	const createMethod = (method, hasBody = false) =>
		hasBody
			? async (url, body, options = {}) => {
				const res = await fn(url, { ...options, method, body });
				return handleResponse(res);
			}
			: async (url, options = {}) => {
				const res = await fn(url, { ...options, method });
				return handleResponse(res);
			};

	fn.get = createMethod('GET');
	fn.post = createMethod('POST', true);
	fn.put = createMethod('PUT', true);
	fn.patch = createMethod('PATCH', true);
	fn.delete = createMethod('DELETE');

	return fn;
}

// 不带知乎鉴权语义的原始请求客户端：日报等免登录端点走它，避免进入 401/403 处理分支
export const rawHttp = addMethods(rawUnifiedFetch);


async function checkedUnifiedFetch(url, options = {}) {
	let hasRetried401 = false;
	// 重建会把失效的登录态清掉，此刻的 isLogin() 已不代表本请求发出时的身份，故在重建前记一份
	let wasLoginBeforeRebuild = false;
	// 本请求是否已就地弹过服务端给的文案，抛错时带给调用方，避免同一次失败弹两条
	let notified = false;

	while (true) {
		if (blockedUntilRefresh) {
			const now = Date.now();
			if (now - blockedTipAt >= 5000) {
				blockedTipAt = now;
				f7.toast.show({ text: '请求已暂停，完成安全验证后刷新页面恢复', closeTimeout: 2000 });
			}
			throw new Error('请求已暂停（安全验证）');
		}

		const response = await rawUnifiedFetch(url, options);
		const code = response.status;
		const responseText = await response.clone().text();

		let decodedContent = null;
		try {
			decodedContent = JSON.parse(responseText);
		} catch (e) { }

		const apiErrorMessage = decodedContent?.error?.message;

		if (code === 403) {
			if (apiErrorMessage) {
				f7.toast.show({ text: apiErrorMessage, position: 'center' });
				notified = true;
			}
			if (decodedContent?.error?.redirect) {
				blockedUntilRefresh = true;
				window.location.href = decodedContent.error.redirect;
			}
		} else if (code === 401 && !options.noCredentialRebuild) {
			// 凭证接口（登录/刷新）自己撞 401 时不能再进重建：正在等它返回的那次重建就是它触发的，互等即死锁
			if (!hasRetried401) {
				hasRetried401 = true;
				wasLoginBeforeRebuild = tokenManager.isLogin();
				// 登录态刷令牌、游客态重取凭证，共用这同一个重建入口
				try {
					await rebuildCredential();
				} catch (e) {
					console.error('凭证重建失败', e);
				}
				// 凭证可能已换新，重试前按当前状态重装请求；沿用这份旧快照等于再撞一次 401
				if (typeof options.assemble === 'function') Object.assign(options, options.assemble());
				continue;
			}
			// 重建过仍被拒才判定凭证不可用；提示同时只留一条，避免并发请求刷屏
			if ((wasLoginBeforeRebuild || tokenManager.isLogin()) && !authLostNotified) {
				authLostNotified = true;
				try {
					tokenManager.clear();
				} catch (e) { }
				f7.dialog.alert('登录状态已失效，已清除失效凭证', '提示', async () => {
					// 单点重建：重新初始化请求栈（回落游客凭证）并刷新全局用户态，免整页 reload
					const [{ initZhihu }, { useUser }] = await Promise.all([
						import('@/services/zhihu/module.js'),
						import('@/composables/userManager.js'),
					]);
					try {
						await initZhihu();
					} catch (e) {
						console.error('请求栈重建失败', e);
					}
					useUser().refreshUser();
					// 重建完成才放开提示闩，避免重建期间又一波请求再弹一条
					authLostNotified = false;
				});
			}
		} else if (code === 400 && apiErrorMessage) {
			f7.toast.show({ text: apiErrorMessage, position: 'center' });
			notified = true;
		}

		if (code < 200 || code >= 300) {
			const err = new Error(describeHttpStatus(code));
			err.status = code;
			if (notified) err.notified = true;
			throw err;
		}

		// 风控也会以 200 回正文（{"error":{"code":40362,…}}）：不能当成功数据交给调用方，
		// 否则列表只会显示"暂无内容"。消息原样抛出，由调用方的提示链路带出中文原因
		if (decodedContent?.error?.code) {
			throw new Error(decodedContent.error.message || '请求被知乎拒绝');
		}

		return response;
	}
}

export default addMethods(checkedUnifiedFetch);
