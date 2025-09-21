import { recommend } from "../zhihu.js";

export function RecommendCards() {
  return {
    recommendations: [],
    nextUrl: null, // 保存下一页URL
    loadingMore: false, // 防止重复加载更多

    async refresh(done) {
      this.loadingMore = false; // 重置加载状态
      await this.fetchData(await recommend(), false);

      // 统一处理刷新结束的逻辑
      if (typeof done === "function") {
        done(); // 用户手动刷新，调用回调
      } else {
        app.ptr.get(".ptr-content").done(); // 代码触发的刷新，手动结束
      }
    },

    async init() {
      const ptrContent = app.ptr.create(".ptr-content");
      ptrContent.on("refresh", this.refresh.bind(this));
      this.setupInfiniteScroll(); // 设置Framework7无限滚动
      ptrContent.refresh();
    },

    async loadMore() {
      if (!this.nextUrl || this.loadingMore) return;
      this.loadingMore = true;
      const res = await recommend(this.nextUrl);
      await this.fetchData(res, true);
      this.loadingMore = false;
    },

    setupInfiniteScroll() {
      const recommendContainer = document.getElementById("recommend-container");
      if (!recommendContainer) return;

      // 创建Framework7无限滚动
      app.infiniteScroll.create(recommendContainer);

      // 监听infinite事件
      recommendContainer.addEventListener("infinite", () => {
        this.loadMore();
      });
    },

    async fetchData(res, append = false) {
      const list = Array.isArray(res.data) ? res.data : [];
      const newItems = list
        .filter((item) => (item.target?.voteup_count ?? 0) > 0)
        .map((item) => {
          let excerptTitleSlice = null;
          try {
            excerptTitleSlice = item.target?.excerpt_title?.slice(0, 30);
          } catch (e) {
            excerptTitleSlice = null;
          }
          const title =
            item.target?.content?.title?.trim() ||
            item.target?.question?.title?.trim() ||
            excerptTitleSlice ||
            "";
          const author = item.target?.author?.name ?? "未知作者";
          const authorUrl = item.target?.author?.url.replace("api.", "") ?? "#";
          const authorUrlBase64 = btoa(authorUrl);
          const votes = item.target?.voteup_count ?? 0;
          const comment_count = item.target?.comment_count ?? 0;
          let content =
            item.target?.excerpt?.trim() ||
            item.target?.excerpt_new?.trim() ||
            item.target?.excerpt_title?.trim() ||
            "";
          if (content.length > 100) {
            content = content.slice(0, 100) + "...";
          }

          const id = item.target.id;
          const dataType = item.target.type;


          return {
            header: title || null,
            content,
            authorUrl,
            authorUrlBase64,
            id,
            dataType,
            footer: `${author} · ${votes} 赞同  ${comment_count} 评论`,
          };
        });

      if (append) {
        this.recommendations = this.recommendations.concat(newItems);
      } else {
        this.recommendations = newItems;
      }

      this.nextUrl = res.paging?.next ?? null;
    },
  };
}
window.RecommendCards = RecommendCards;
