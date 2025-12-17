
export const RECOMMEND_DATA = [
    { id: '1', title: 'Example Article 1', excerpt: 'This is a summary.', type: 'article', metrics: { comments: 10, likes: 20 } },
    { id: '2', title: 'Example Article 2', excerpt: 'Another summary.', type: 'article', metrics: { comments: 5, likes: 10 } },
];
export const HOT_DATA = [...RECOMMEND_DATA];
export const DAILY_DATA = [...RECOMMEND_DATA];
export const THOUGHTS_DATA = [...RECOMMEND_DATA];
export const getUserById = (id) => ({ id, name: 'User ' + id, avatar: '' });
