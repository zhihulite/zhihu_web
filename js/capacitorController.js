function setStatusBar(color) {
  if (typeof Capacitor != "undefined") {
    window.Capacitor.Plugins.StatusBar.setStyle({ style: color });
  } else {
    console.log("没有Capacitor环境,跳过设置StatusBar");
  }
}

function hasNativeHttp() {
  try {
    return !!(
      window.Capacitor &&
      window.Capacitor.Plugins &&
      typeof window.Capacitor.Plugins.CapacitorHttp?.get === "function"
    );
  } catch {
    return false;
  }
}

async function nativeGet(url, { headers = {}, params = {}, ...rest } = {}) {
  if (hasNativeHttp()) {
    const { CapacitorHttp } = window.Capacitor.Plugins;
    const res = await CapacitorHttp.get({
      url,
      headers,
      params,
      ...rest, // 可包含 connectTimeout, readTimeout, responseType 等
    });
    return {
      data: res.data,
      status: res.status,
      headers: res.headers || {},
      url: res.url,
    };
  }

  // Web 环境回退
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) usp.append(k, String(v));
  });
  const fullUrl = usp.toString()
    ? `${url}${url.includes("?") ? "&" : "?"}${usp.toString()}`
    : url;

  const resp = await fetch(fullUrl, { method: "GET", headers });
  const contentType = resp.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await resp.json()
    : await resp.text();

  return {
    data,
    status: resp.status,
    headers: Object.fromEntries(resp.headers.entries()),
    url: resp.url,
  };
}
