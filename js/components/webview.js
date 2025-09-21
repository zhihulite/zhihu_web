let InAppBrowser = null;
if (typeof Capacitor != "undefined") {
  InAppBrowser = Capacitor.Plugins.InAppBrowser;
} else {
  console.log("没有Capacitor环境,跳过InAppBrowser");
}

export async function openLink(url, title = "Webview", cookie = null) {
  if (InAppBrowser) {
    await InAppBrowser.openWebView({
      url: url,
      title: title,
      enabledSafeBottomMargin: false,
    });
  } else {
    app.views.main.router.navigate(`/webview/${btoa(url)}`);
  }
}

window.openLink = openLink;
