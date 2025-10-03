const appVersion = "10.12.0";
const apiVersion = "101_1_1.0";
const appBuild = "21210";
const appBundle = "com.zhihu.android";
const appID = "1355";
const platformId = "12";

class ZhihuRequest {
  constructor({ encryptData, loginData, zsts = {}, defaultHeaders = {} }) {
    if (typeof encryptData !== "function") {
      throw new Error("必须提供 encryptData 加密函数");
    }

    console.log("BindLoginData:", loginData);
    this.udid = loginData.udid;
    if (!this.udid) {
      throw new Error("提供 loginData 缺少 udid，请先使用游客登录获取 udid");
    }

    loginData = loginData.guest || loginData;
    this.accessToken = "Bearer " + loginData.access_token;
    this.cookie = Object.entries(loginData.cookie || {})
      .filter(([_, v]) => v)
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");

    const [zst82, zst81] = Array.isArray(zsts) ? zsts : [];
    this.zst81 = zst81;
    this.zst82 = zst82;

    this.encryptData = encryptData.bind(this);

    const x_app_za = "OS=Android";
    const appBundle = "com.zhihu.android";
    const user_agent = `${appBundle}/Futureve/${appVersion} Mozilla/5.0 (Linux; Android; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.1000.10 Mobile Safari/537.36`;

    // 将默认 Headers 分为 App 专用和通用两部分
    this.commonDefaultHeaders = {
      "User-Agent": user_agent,
      "x-Zse-93": apiVersion,
      ...(this.cookie && { Cookie: this.cookie }),
      ...(this.accessToken && { Authorization: this.accessToken }),
      ...(this.udid && { "x-udid": this.udid }),
      ...(this.zst81 && { "X-ZST-81": this.zst81 }),
      ...(this.zst82 && { "X-ZST-82": this.zst82 }),
      ...defaultHeaders,
    };

    this.appSpecificHeaders = {
      "x-api-version": "3.0.93",
      "x-app-version": appVersion,
      "x-app-za": x_app_za,
      "x-app-bundleid": appBundle,
      "x-app-flavor": "play",
      "x-app-build": "release",
    };

    this.defaultHeaders = {
      ...this.commonDefaultHeaders,
      ...this.appSpecificHeaders,
    };
  }

  async request(
    method,
    url,
    data = {},
    { headers = {}, encryptBody = true, isWWW = false } = {}
  ) {
    method = method.toUpperCase();
    const isGet = method === "GET";

    let baseDefaultHeaders = this.commonDefaultHeaders;
    if (!isWWW) {
      baseDefaultHeaders = this.defaultHeaders;
    }

    const requestHeaders = {
      ...baseDefaultHeaders,
      ...headers,
      ...(isGet && {
        "x-Zse-96": `1.0_${this.encryptData(url)}`,
      }),
    };

    let body = null;
    if (!isGet && data) {
      body =
        !data || Object.keys(data).length === 0
          ? ""
          : encryptBody
          ? this.encryptData(data, true)
          : JSON.stringify(data);

      requestHeaders["Content-Type"] = encryptBody
        ? "application/x-www-form-urlencoded"
        : "application/json";
    }

    try {
      console.log(`[ZhihuRequest] ${method} ${url}`);
      const response = await unifiedFetch(url, {
        method,
        headers: requestHeaders,
        body,
      });

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`);
        error.response = response;
        throw error;
      }

      return response.json();
    } catch (error) {
      console.error(`[ZhihuRequest] ${method} ${url} failed:`, error);
      throw error;
    }
  }

  get(url, options) {
    return this.request("GET", url, null, options);
  }
  post(url, data, options) {
    return this.request("POST", url, data, options);
  }
  patch(url, data, options) {
    return this.request("PATCH", url, data, options);
  }
  put(url, data, options) {
    return this.request("PUT", url, data, options);
  }
  delete(url, options) {
    return this.request("DELETE", url, null, options);
  }
}

let globalZhihuInstance = null;

import { getLAESInstance } from "./laes_utils.js";
const laes_utils = getLAESInstance();
export function initZhihu({ loginData, zsts, defaultHeaders }) {
  const LAESEncrypt = laes_utils.createEncryptor(
    "541a3a5896fbefd351917c8251328a236a7efbf27d0fad8283ef59ef07aa386dbb2b1fcbba167135d575877ba0205a02f0aac2d31957bc7f028ed5888d4bbe69ed6768efc15ab703dc0f406b301845a0a64cf3c427c82870053bd7ba6721649c3a9aca8c3c31710a6be5ce71e4686842732d9314d6898cc3fdca075db46d1ccf3a7f9b20615f4a303c5235bd02c5cdc791eb123b9d9f7e72e954de3bcbf7d314064a1eced78d13679d040dd4080640d18c37bbde",
    [102, 48, 53, 53, 49, 56, 53, 54, 97, 97, 53, 55, 53, 102, 97, 97]
  );
  function encrypt_data(data, isFormData = false) {
    if (!isFormData && typeof data !== "string") {
      throw new Error("URL data must be a string");
    }
    if (isFormData && typeof data !== "string") {
      throw new Error("Form data must be a string");
    }

    if (!isFormData) {
      const apiPrefix = "https://api.zhihu.com";
      if (!data.startsWith(apiPrefix)) {
        throw new Error(`URL must start with ${apiPrefix}`);
      }
      const apiPath = data.slice(apiPrefix.length);
      data = `${apiVersion}+${apiPath}+${appVersion}+${this.accessToken}+${this.udid}`;
      data = md5(data);
    } else {
      data = btoa(encodeURIComponent(data));
    }

    return LAESEncrypt(data);
  }

  loginData = {
    udid: "ahPURXrgGhtLBSaMAkkLZ1XLjOPi4xm2pr0=",
    guest: {
      access_token:
        "gt2.0AAAAAIw3E2gbGuB6RdQTagAAAAxNVQJgAgAZuafvehJMOFIfwlmesYN6qPaMxA==",
      token_type: "bearer",
      user_type: "guest",
      id: "0ae9ee71229d74a123a3ce37efa9a403",
      uid: 1953120204302321000,
      push_channel: "pm_n_1dad208ec1f07aa9b3ef265ba8ab5daa",
      URL: "",
      cookie: {
        q_c0: "",
        z_c0: "gt2.0AAAAAIw3E2gbGuB6RdQTagAAAAxNVQJgAgAZuafvehJMOFIfwlmesYN6qPaMxA==",
      },
      created_at: 0,
    },
  };

  globalZhihuInstance = new ZhihuRequest({
    encryptData: encrypt_data,
    loginData: loginData,
    zsts: null,
  });

  window.$zhihu = globalZhihuInstance;

  console.log("ZhihuRequest 已全局初始化");
  return globalZhihuInstance;
}

export function updateZhihuLoginData(loginData, zsts, defaultHeaders) {
  if (!globalZhihuInstance) {
    console.warn("ZhihuRequest 尚未初始化，请先调用 initZhihu");
    return null;
  }
  globalZhihuInstance.updateLoginData(loginData, zsts, defaultHeaders);
  return globalZhihuInstance;
}

export function getZhihuInstance() {
  return globalZhihuInstance;
}

initZhihu({});

export {
  initZhihu as init,
  updateZhihuLoginData as update,
  getZhihuInstance as get,
};
