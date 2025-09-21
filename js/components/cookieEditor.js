/* js/cookie-editor.js */

export function CookieEditor() {
  return {
    // 这个属性将通过 v-model 绑定到 textarea 的内容
    cookieJsonString: "",

    // 用于 localStorage 的键名
    storageKey: "zhihuCookies",

    /**
     * 从 localStorage 加载 cookie 数据并进行格式化，以便在文本域中显示。
     * 这个方法会在弹窗打开时被调用。
     */
    loadCookies() {
      console.log("正在从 localStorage 加载 cookies...");
      const savedCookies = localStorage.getItem(this.storageKey);

      try {
        // 尝试解析存储的 JSON 字符串
        const parsedJson = JSON.parse(savedCookies);
        // 为了在 textarea 中美观地显示，使用缩进（2个空格）来格式化 JSON
        this.cookieJsonString = JSON.stringify(parsedJson, null, 2);
      } catch (e) {
        // 如果解析出错（比如 localStorage 中没有值或值不是有效的 JSON），
        // 则默认显示为一个空的、格式化好的 JSON 对象。
        this.cookieJsonString = JSON.stringify({}, null, 2);
      }
    },

    /**
     * 验证并保存修改后的 cookie 数据到 localStorage。
     * 这个方法会在点击“保存”按钮时被调用。
     */
    saveCookies() {
      try {
        // 首先，通过尝试解析来验证文本域中的内容是否为有效的 JSON 格式。
        JSON.parse(this.cookieJsonString);

        // 如果解析成功，说明格式有效，直接将文本域中的字符串存入 localStorage。
        localStorage.setItem(this.storageKey, this.cookieJsonString);

        // 使用 Framework7 的 Toast 提示给用户反馈
        window.app.toast
          .create({
            text: "Cookies 保存成功!",
            position: "center",
            closeTimeout: 2000,
          })
          .open();

        // 保存成功后关闭弹窗
        window.app.popup.close("#cookies-popup");
      } catch (e) {
        // 如果 JSON.parse 失败，说明用户输入的格式无效。
        console.error("无效的 JSON 格式:", e);

        // 显示一个错误提示
        window.app.toast
          .create({
            text: "错误: 无效的 JSON 格式，请检查您的输入。",
            position: "center",
            closeTimeout: 3000,
          })
          .open();
      }
    },
  };
}
window.CookieEditor = CookieEditor;
