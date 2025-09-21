export function zStauts() {
  let inLogin = true;
  console.log("zStauts loading cookies...");
  const savedCookies = localStorage.getItem("zhihuCookies");
  let cookies = null;
  let d_c0 = null;
  try {
    // 尝试解析存储的 JSON 字符串
    cookies = JSON.parse(savedCookies);
    d_c0 = cookies["d_c0"];
  } catch (e) {
    inLogin = false;
  }
  return {
    inLogin,
    cookies,
    d_c0,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
    XZse93: "101_3_3.0",
    XZst81:
      "3_2.0aR_sn77yn6O92wOB8hPZnQr0EMYxc4f18wNBUgpTQ6nxERFZY0Y0-4Lm-h3_tufIwJS8gcxTgJS_AuPZNcXCTwxI78YxEM20s4PGDwN8gGcYAupMWufIeQuK7AFpS6O1vukyQ_R0rRnsyukMGvxBEqeCiRnxEL2ZZrxmDucmqhPXnXFMTAoTF6RhRuLPFiN0UhN0TUxynBOY8cXmv93Kk7XL64SB6LSmMJNGEuCCFGVf8gVfNvxOZUoTvLeBbgxmmuwYUvHGOCXLzUCMRGpKcgUKiw2VLrHLMXVKugLfack9hwcVf_cGEvembXN_QX3GnG3CXDg1VhH_0U2GmMHCnrLLawO8qwofKRFOav3_FJN9OqfzwcLKQbCMzwefc9pO59LY8cx9owY12iVMYLoLuUof-GoK2JH1bGLfCbpyLGtVgu30Zhg0-Co0bBwVIDSLKUxY2690TCxfSqw1UB2YrGLOQ_NKChXOBrOC",
  };
}
window.zStauts = zStauts;

export function zHeader(apiUrl) {
  const zs = zStauts();
  return {
    accept: "*/*",
    "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8",
    "sec-ch-ua":
      '"Not;A=Brand";v="99", "Microsoft Edge";v="139", "Chromium";v="139"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",

    "x-api-version": "3.0.53",
    "x-requested-with": "fetch",
    "x-zse-93": zs.XZse93,
    "x-zse-96": get_xzse96(zs.d_c0, apiUrl),
    "x-zst-81": zs.XZst81,
  };
}
window.zHeader = zHeader;
window.zhihu = window.getZhihu()
export async function recommend() {
    try {
      const json = await zhihu.get("https://api.zhihu.com/topstory/recommend",{ isWWW: true });
      return json ?? {};
    } catch (err) {
      console.error(err);
      return {};
    }
}

export async function login() {
  if (typeof Capacitor == "undefined") {
    alert("抱歉, 纯Web环境暂不支持图形化登录");
    return;
  }

  const InAppBrowser = Capacitor.Plugins.InAppBrowser;
  await InAppBrowser.clearAllCookies();

  // 打开知乎登录页
  await InAppBrowser.openWebView({
    url: "https://www.zhihu.com/signin",
    enabledSafeBottomMargin: false,
  });

  await InAppBrowser.executeScript({
    code: `
            alert("请登录,程序会自动获取您的cookie");
          `,
  });

  let loggedIn = false;
  let closed = false;

  // 监听关闭事件（用户点击左上角 ×）
  const handle = await InAppBrowser.addListener("closeEvent", () => {
    console.log("用户点击了关闭按钮");
    closed = true;
  });

  // 等待登录或关闭
  while (!loggedIn && !closed) {
    try {
      const cookies = await InAppBrowser.getCookies({
        url: "https://www.zhihu.com",
      });

      if (cookies["z_c0"]) {
        loggedIn = true;
        // 保存到 localStorage
        localStorage.setItem("zhihuCookies", JSON.stringify(cookies));
        //关闭 InAppBrowser
        await InAppBrowser.close();
        console.log("完整 Cookies:", cookies);
        alert("登录成功!");
        break;
      }
    } catch (e) {
      console.error("获取 cookies 出错", e);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // 移除监听器
  handle.remove();

  if (closed && !loggedIn) {
    alert("⚠️ 登录窗口已关闭，未获取到 Cookie");
  }
}
