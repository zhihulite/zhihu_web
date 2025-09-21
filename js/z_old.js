export async function recommend() {
  try {
    const res = await unifiedFetch("https://api.zhihu.com/topstory/recommend");
    // 如果 res 是字符串，就解析成对象
    const json = typeof res === "string" ? JSON.parse(res) : res;
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
