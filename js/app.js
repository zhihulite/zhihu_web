if (!typeof GM_xmlhttpRequest === 'function') {
	alert('未检测到油猴（Tampermonkey环境！');
	window.location.href = 'https://greasyfork.org/scripts/508709';
}
if (window.innerWidth >= 768) {
	alert('请在移动端设备上使用本页面以获得最佳体验。即将跳转到pc端页面');
	window.location.href = 'https://zhihulite.github.io/zhihu_webpc/';
}
// 导入
const { createApp } = PetiteVue;
import { unifiedFetch } from "./request.js";
import { RecommendCards } from "./components/recommend.js";
import { ThemeComponent } from "./components/theme.js";
import { userCard } from "./components/userCard.js";
import { CookieEditor } from "./components/cookieEditor.js";
import { openLink } from "./components/webview.js";
import { } from "./components/comments.js";
// import {} from "./capacitorController.js";

import { Mypep } from "./components/people.js"
function loadPetiteVue() {
  // 挂载到每个Page
  const mounted = new WeakSet();
  document.querySelectorAll(".app-page").forEach((el) => {
    let observer; // 提前声明，避免作用域错误
    const tryMount = () => {
      if (mounted.has(el)) return;
      if (el.innerHTML.trim() === "") return;
      mounted.add(el);
      createApp().mount(el);
      console.log("petite-vue挂载" + el.id);
      if (observer) observer.disconnect();
    };
    // 1) 先尝试一次（如果一开始就有内容）
    tryMount();
    // 2) 如果还没挂上，监听变化直到有内容
    if (!mounted.has(el)) {
      observer = new MutationObserver(tryMount);
      observer.observe(el, { childList: true, subtree: true });
    }
  });
}
loadPetiteVue();

// 错误处理
window.onerror = function (message, source, lineno, colno, error) {
  alert(`${message}\n来源: ${source}\n行: ${lineno}, 列: ${colno}`);
};

window.addEventListener("unhandledrejection", function (event) {
  alert(`未处理的 Promise 错误: ${event.reason}`);
});
