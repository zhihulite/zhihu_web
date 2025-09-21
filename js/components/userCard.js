import { login } from "../zhihu.js";

export function userCard() {
  return {
    username: "未登录",
    handleClick() {
      login();
    },
  };
}
