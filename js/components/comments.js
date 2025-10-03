// js/components/comments.js

export function CommentsComponent() {
  return {
    // --- 状态 ---
    rootComments: [],
    loading: true,
    error: null,
    paging: { is_end: true, next: null },
    total: 0,

    // --- 方法 ---

    /**
     * 初始化组件，加载第一页的根评论及其子评论
     */
    async init(resourceType, resourceId) {
      this.loading = true;
      this.error = null;
      const result = await this.fetchComments({ resourceType, resourceId });

      // 为获取到的根评论加载其第一页的子评论
      for (const comment of result.comments) {
        if (comment.replies_count > 0) {
          const childResult = await this.fetchComments({
            commentId: comment.id,
          });
          comment.child_comments = childResult.comments;
          comment.child_paging = childResult.paging;
          comment.child_comments_loaded = true; // 标记为已加载
        }
      }

      this.rootComments = result.comments;
      this.paging = result.paging;
      this.total = result.total;
      this.loading = false;
    },

    /**
     * 加载更多根评论, 并为它们加载第一页的子评论
     */
    async loadMore() {
      if (this.paging.is_end || !this.paging.next) {
        console.log("没有更多根评论了。");
        return;
      }

      const result = await this.fetchComments({
        nextUrl: this.paging.next,
      });

      // 为新加载的根评论获取其子评论
      for (const comment of result.comments) {
        if (comment.replies_count > 0) {
          const childResult = await this.fetchComments({
            commentId: comment.id,
          });
          comment.child_comments = childResult.comments;
          comment.child_paging = childResult.paging;
          comment.child_comments_loaded = true;
        }
      }

      this.rootComments.push(...result.comments);
      this.paging = result.paging;
      console.log("新评论已加载:", result.comments);
    },

    /**
     * 切换显示/隐藏指定评论的子评论（回复）
     */
    async toggleReplies(comment) {
      // 如果子评论已经加载，则切换可见性
      if (comment.child_comments_loaded) {
        comment.show_child_comments = !comment.show_child_comments;
        return;
      }

      // 如果正在加载中，则不执行任何操作
      if (comment.child_comments_loading) return;

      // 开始加载子评论
      comment.child_comments_loading = true;
      const result = await this.fetchComments({
        resourceType: null, // 子评论不需要
        resourceId: null, // 子评论不需要
        commentId: comment.id,
      });

      comment.child_comments = result.comments;
      comment.child_paging = result.paging;
      comment.child_comments_loaded = true;
      comment.show_child_comments = true;
      comment.child_comments_loading = false;
    },

    /**
     * 加载更多子评论
     */
    async loadMoreChildren(comment) {
      if (!comment.child_paging || comment.child_paging.is_end) return;

      const result = await this.fetchComments({
        nextUrl: comment.child_paging.next,
      });
      comment.child_comments.push(...result.comments);
      comment.child_paging = result.paging;
    },

    /**
     * 获取所有根评论及其所有子评论
     */
    async fetchAllComments(resourceType, resourceId) {
      console.log(
        `[fetchAll] 开始获取 ${resourceType}/${resourceId} 的所有评论...`
      );
      // 1. 获取所有根评论
      let rootPaging = {};
      let allRootComments = [];
      let nextUrl = null;

      // 先获取第一页
      const firstPage = await this.fetchComments({ resourceType, resourceId });
      allRootComments.push(...firstPage.comments);
      rootPaging = firstPage.paging;

      // 如果还有下一页，循环获取
      while (!rootPaging.is_end && rootPaging.next) {
        console.log("[fetchAll] 获取下一页根评论:", rootPaging.next);
        const nextPage = await this.fetchComments({ nextUrl: rootPaging.next });
        allRootComments.push(...nextPage.comments);
        rootPaging = nextPage.paging;
      }
      console.log(
        `[fetchAll] 所有根评论获取完毕，共 ${allRootComments.length} 条。`
      );

      // 2. 遍历根评论，获取它们的所有子评论
      for (const comment of allRootComments) {
        if (comment.replies_count > 0) {
          console.log(
            `[fetchAll] 正在获取评论 ${comment.id} 的 ${comment.replies_count} 条回复...`
          );
          comment.child_comments = await this._fetchAllReplies(comment.id);
        }
      }

      console.log("[fetchAll] 所有评论及回复获取完成。");
      this.rootComments = allRootComments;
      return allRootComments;
    },

    /**
     * [内部辅助] 获取单个评论的所有回复
     * @private
     */
    async _fetchAllReplies(commentId) {
      let repliesPaging = {};
      let allReplies = [];

      // 获取第一页回复
      const firstPage = await this.fetchComments({ commentId });
      allReplies.push(...firstPage.comments);
      repliesPaging = firstPage.paging;

      // 循环获取剩余的回复
      while (!repliesPaging.is_end && repliesPaging.next) {
        const nextPage = await this.fetchComments({
          nextUrl: repliesPaging.next,
        });
        allReplies.push(...nextPage.comments);
        repliesPaging = nextPage.paging;
      }
      return allReplies;
    },

    /**
     * 通用的评论获取函数
     */
    async fetchComments({
      resourceType,
      resourceId,
      commentId = null,
      nextUrl = null,
    }) {
      const format = (item) => ({
        id: item.id,
        author_name: item.author?.member?.name || "匿名用户",
        author_avatar: item.author?.member?.avatar_url,
        ip_location: item.address_text || null,
        content: item.content,
        like_count: item.vote_count || 0,
        created_time: new Date(item.created_time * 1000).toLocaleDateString(),
        replies_count: item.replies_count || item.child_comment_count || 0,
        reply_to_author: item.reply_to_author?.member?.name || null,
        // 用于子评论的UI状态
        child_comments: [],
        child_paging: { is_end: true, next: null },
        child_comments_loaded: false,
        child_comments_loading: false,
        show_child_comments: false,
      });

      const getApiType = (type) => {
        if (type === "p") return "articles";
        if (type === "answer") return "answers"; // 从单数更正为复数
        return type;
      };

      let url;
      if (nextUrl) {
        url = nextUrl;
      } else if (commentId) {
        url = `https://api.zhihu.com/comments/${commentId}/replies?limit=20`;
      } else {
        url = `https://api.zhihu.com/${getApiType(
          resourceType
        )}/${resourceId}/comments?limit=20&order=normal`;
      }

      try {
        const res = await window.zhihu.get(url);

        // 跳过父评论
        const commentsData = commentId ? res.data.slice(1) : res.data;

        return {
          comments: commentsData.map(format),
          paging: res.paging,
          total: res.paging.totals || 0,
        };
      } catch (err) {
        console.error(`获取评论失败: ${url}`, err);
        this.error = "评论加载失败";
        return { comments: [], paging: { is_end: true, next: null }, total: 0 };
      }
    },
  };
}

window.CommentsComponent = CommentsComponent;
