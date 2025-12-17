window.canLoad = true;

function unifiedFetch(url, options = {}) {
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
				const code = response.status;
				const responseText = response.responseText;
				const responseHeaders = response.responseHeaders;

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
					if (typeof getLogin === 'function' && getLogin()) {
						if (!window.canLoad) {
							alert("登录状态已失效 已自动帮你清除失效的登录状态 你可以点击下方我知道了来跳转登录");
							if (confirm("我知道了")) {
								if (typeof clearAllCookies === 'function') clearAllCookies();
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

				const headers = new Headers();
				if (responseHeaders) {
					for (const [k, v] of Object.entries(responseHeaders)) {
						headers.append(k, v);
					}
				}
				const result = new Response(responseText, {
					status: code,
					headers
				});

				if (code >= 200 && code < 300) {
					resolve(result);
				} else {
					reject(new Error(`HTTP ${code}`));
				}
			},
			onerror: (error) => {
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

window.unifiedFetch = unifiedFetch;

export default unifiedFetch;