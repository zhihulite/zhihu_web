// unified-http.js

function buildQueryString(params) {
    if (!params || Object.keys(params).length === 0) return '';
    const esc = encodeURIComponent;
    return Object.keys(params)
        .map(k => esc(k) + '=' + esc(params[k]))
        .join('&');
}

function parseResponseHeaders(headerStr) {
    const headers = {};
    if (!headerStr) return headers;
    const headerPairs = headerStr.trim().split(/\r?\n/);
    for (const pair of headerPairs) {
        const [key, ...valueParts] = pair.split(': ');
        if (key && valueParts.length > 0) {
            headers[key.toLowerCase()] = valueParts.join(': ');
        }
    }
    return headers;
}

async function unifiedFetchForBrowserUnderGM(url, options = {}) {
    const { method = 'GET', headers = {}, body = null } = options;

    return new Promise((resolve, reject) => {
        try {
            let gmHeaders = { ...headers };
            let gmCookie = null;
            if (gmHeaders.cookie !== undefined) {
                gmCookie = gmHeaders.cookie;
                delete gmHeaders.cookie;
            }

            let finalUrl = url;
            if (options.params && (method === 'GET' || method === 'HEAD')) {
                const queryString = buildQueryString(options.params);
                if (queryString) {
                    finalUrl += (finalUrl.includes('?') ? '&' : '?') + queryString;
                }
            }

            const gmOptions = {
                method: method.toUpperCase(),
                url: finalUrl,
                headers: gmHeaders,
                data: body,
                cookie: gmCookie,
                anonymous: true,
                onload(response) {
                    const responseHeadersObj = parseResponseHeaders(response.responseHeaders);
                    const fetchResponse = new Response(response.responseText, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: new Headers(responseHeadersObj)
                    });
                    resolve(fetchResponse);
                },
                onerror(error) {
                    console.error(`[GM/TM] ${method} ${url} 请求失败:`, error);
                    reject(new TypeError('Failed to fetch'));
                },
                ontimeout() {
                    console.error(`[GM/TM] ${method} ${url} 请求超时`);
                    reject(new TypeError('Network request failed'));
                }
            };

            window.GM_xmlhttpRequest(gmOptions);
        } catch (error) {
            console.error(`[GM/TM] ${method} ${url} 调用异常:`, error);
            reject(new TypeError('Failed to fetch'));
        }
    });
}

async function unifiedFetchForCapacitor(url, options = {}) {
    if (!nativeHttp) {
        throw new Error("[UnifiedHttp] Capacitor HTTP plugin 未初始化");
    }

    const {
        method = 'GET',
        headers = {},
        body = null,
        params = {},
        connectTimeout = 10000,
        readTimeout = 10000
    } = options;

    let finalUrl = url;
    if (params && Object.keys(params).length > 0) {
        const queryString = buildQueryString(params);
        if (queryString) {
            finalUrl += (finalUrl.includes('?') ? '&' : '?') + queryString;
        }
    }

    const capacitorOptions = {
        url: finalUrl,
        method: method.toUpperCase(),
        headers: headers,
        connectTimeout: connectTimeout,
        readTimeout: readTimeout,
    };

    if (body !== null && body !== undefined) {
        capacitorOptions.data = body;
    }

    try {
        const response = await nativeHttp.request(capacitorOptions);
        const fetchResponse = new Response(response.data, {
            status: response.status,
            statusText: response.status.toString(),
            headers: new Headers(response.headers || {})
        });
        return fetchResponse;
    } catch (error) {
        console.error(`[Capacitor] ${method} ${url} 请求异常:`, error);
        if (error.message && (error.message.includes('Network') || error.message.includes('timeout'))) {
             return Promise.reject(new TypeError('Failed to fetch'));
        } else {
             return Promise.reject(new Error(`Capacitor HTTP Error: ${error.message}`));
        }
    }
}

export async function unifiedFetch(input, init = {}) {
    let url;
    let options = init;

    if (input instanceof Request) {
        url = input.url;
        options = {
            method: input.method,
            headers: new Headers(input.headers),
            body: input.body,
            ...init
        };
    } else {
        url = String(input);
    }

    if (options.method) {
        options.method = options.method.toUpperCase();
    }

    if (typeof Capacitor !== "undefined") {
        console.log("[UnifiedFetch] Using Capacitor native HTTP");
        return unifiedFetchForCapacitor(url, options);
    } else if (typeof window.GM_xmlhttpRequest === "function") {
        console.log("[UnifiedFetch] Using GM/Tampermonkey XMLHttpRequest");
        return unifiedFetchForBrowserUnderGM(url, options);
    } else {
        alert("请前往https://greasyfork.org/scripts/508709 安装脚本后使用 (中国大陆可能无法访问)");
        throw new Error("[UnifiedFetch] Neither Capacitor nor GM/Tampermonkey found");
        return fetch(input, init);
    }
}

window.unifiedFetch = unifiedFetch;