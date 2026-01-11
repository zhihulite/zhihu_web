window.canLoad = true;

function rawUnifiedFetch(url, options = {}) {
	return new Promise((resolve, reject) => {
		if (!window.canLoad) {
			reject(new Error('Request blocked by window.canLoad'));
			return;
		}

		const method = (options.method || 'GET').toUpperCase();
		const headers = options.headers || {};
		const body = options.body;
		const isGet = method === 'GET' || method === 'HEAD';
		const requestData = isGet ? null : body;

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

				if (code >= 200 && code < 300) {
					resolve(result);
				} else {
					resolve(result);
				}
			},
			onerror: (error) => {
				console.error(`[request] ${method} ${url} failed:`, error);
				reject(new Error(`Network error: ${error?.error || 'unknown'}`));
			}
		};

		if (requestData !== null) {
			gmOptions.data = requestData;
		}

		if (customCookie !== undefined) {
			gmOptions.anonymous = true
			gmOptions.cookie = customCookie;
		}

		GM_xmlhttpRequest(gmOptions);
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

window.unifiedFetch = addMethods(rawUnifiedFetch);


async function checkedUnifiedFetch(url, options = {}) {
	const response = await rawUnifiedFetch(url, options);
	const code = response.status;
	const responseText = await response.clone().text();

	let decodedContent = null;
	try {
		decodedContent = JSON.parse(responseText);
	} catch (e) { }

	if (code === 403) {
		if (decodedContent?.error?.message && decodedContent?.error?.redirect) {
			if (!window.canLoad) {
				alert(decodedContent.error.message);
				if (confirm("立即跳转")) {
					window.location.href = decodedContent.error.redirect;
					alert("已跳转 成功后请自行退出");
				}
			}
		} else if (decodedContent?.error?.message) {
			alert(decodedContent.error.message);
		}
	} else if (code === 401) {
		if (typeof window.getLogin === 'function' && window.getLogin()) {
			if (!window.canLoad) {
				alert("登录状态已失效 已自动帮你清除失效的登录状态 你可以点击下方我知道了来跳转登录");
				if (confirm("我知道了")) {
					if (typeof window.clearAllCookies === 'function') window.clearAllCookies();
					localStorage.removeItem("signdata");
					localStorage.removeItem("idx");
					localStorage.removeItem("udid");
					window.location.href = "https://www.zhihu.com/signin";
				}
			}
		}
	} else if (code === 400) {
		if (decodedContent?.error?.message) {
			alert(decodedContent.error.message);
		}
	}

	if (code < 200 || code >= 300) {
		throw new Error(`HTTP ${code} ${responseText}`);
	}

	return response;
}

export default addMethods(checkedUnifiedFetch);