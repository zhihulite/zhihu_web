var $ = Dom7;
var app = new Framework7({
  name: "Zyphron", // App name
  theme: localStorage.getItem("f7style") || "md", // Get theme from storage

  el: "#app", // App root element
  ptr: true,
  // App routes
  routes: routes,
  toolbar: {
    hideOnPageScroll: true,
  },
  view: {
    iosSwipeBack: true,
  },
  touchRippleElements:
    ".ripple, .link, .item-link, .list-button, .links-list a, .button, button, .input-clear-button, .dialog-button, .tab-link, .item-radio, .item-checkbox, .actions-button, .searchbar-disable-button, .fab a, .checkbox, .radio, .data-table .sortable-cell:not(.input-cell), .notification-close-button, .stepper-button, .stepper-button-minus, .stepper-button-plus, .menu-item-content, .list.accordion-list .accordion-item-toggle .recommend-card",
});
window.app = app; // 方便全局访问

import { init, update, get } from "./zhihu-module.js";

window.initZhihu = init;
window.updateZhihu = update;
window.getZhihu = get;

// Login Screen Demo
$("#my-login-screen .login-button").on("click", function () {
  var username = $('#my-login-screen [name="username"]').val();
  var password = $('#my-login-screen [name="password"]').val();

  // Close login screen
  app.loginScreen.close("#my-login-screen");

  // Alert username and password
  app.dialog.alert("Username: " + username + "<br/>Password: " + password);
});
window.alert = app.dialog.alert;

function toggleToolbar(show) {
  const toolbar = document.querySelector(".toolbar");
  if (!toolbar) return;

  if (show) {
    // 取消强制隐藏 class
    toolbar.classList.remove("toolbar-force-hide");
    app.toolbar.show(toolbar, true); // true 表示带动画
  } else {
    // 使用 F7 API 隐藏 toolbar
    app.toolbar.hide(toolbar, true);
    // 加上强制隐藏 class，避免滚动再次弹出
    toolbar.classList.add("toolbar-force-hide");
  }
}

// ======================
// 页面事件绑定
// ======================

// 进入主页（动画前触发，防止延迟导致看不到动画）
document.addEventListener("page:beforein", function (e) {
  if (e.target && e.target.dataset.name === "home") {
    toggleToolbar(true);
    console.log("[framework7app.js] in home page");
  }
});

// 离开主页（动画完成后触发）
document.addEventListener("page:afterout", function (e) {
  if (e.target && e.target.dataset.name === "home") {
    toggleToolbar(false);
    console.log("[framework7app.js] out home page");
  }
});
