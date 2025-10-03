// js/components/comments.js

export function CommentsComponent() {
  return {
    // --- State ---
    rootComments: [],
    loading: true,
    error: null,
    paging: { is_end: true, next: null },
    total: 0,

    // --- Methods ---

    /**
     * 初始化组件，加载第一页的根评论
     */
    async init(resourceType, resourceId) {
      this.loading = true;
      this.error = null;
      const result = await this.fetchComments({ resourceType, resourceId });
      this.rootComments = result.comments;
      this.paging = result.paging;
      this.total = result.total;
      this.loading = false;
    },

    /**
     * 加载更多根评论
     */
    async loadMore(resourceType, resourceId) {
      if (this.paging.is_end || !this.paging.next) return;

      const result = await this.fetchComments({
        resourceType,
        resourceId,
        nextUrl: this.paging.next,
      });
      this.rootComments.push(...result.comments);
      this.paging = result.paging;
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
        // UI state for child comments
        child_comments: [],
        child_paging: { is_end: true, next: null },
        child_comments_loaded: false,
        child_comments_loading: false,
        show_child_comments: false,
      });

      const getApiType = (type) => {
        if (type === "p") return "articles";
        if (type === "answer") return "answers"; // Corrected from singular to plural
        return type;
      };

      let url;
      if (nextUrl) {
        url = nextUrl;
      } else if (commentId) {
        url = `https://api.zhihu.com/comments/${commentId}/replies?limit=10`;
      } else {
        url = `https://api.zhihu.com/${getApiType(
          resourceType
        )}/${resourceId}/comments?limit=10&order=normal`;
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
