
export const homeCardRender = {
    formatTitle(item) {
        const truncateLength = 30;
        let title = '';

        if (item.target?.content?.title) {
            title = item.target.content.title.trim();
        } else if (item.target?.question?.title) {
            title = item.target.question.title.trim();
        } else if (item.target?.excerpt_title) {
            title = item.target.excerpt_title.trim();
        }

        // 如果标题太长，截取
        if (title && truncateLength && title.length > truncateLength) {
            return title.substring(0, truncateLength) + '...';
        }
        return title || '';
    },
    getDataType(item) {
        if (item.target && item.target.type) {
            return item.target.type;
        }
        return item.type;
    },
    getId(item) {
        if (item.target && item.target.id) {
            return item.target.id;
        }
        return item.id;
    },
};
