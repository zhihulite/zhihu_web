// src/services/http.js
// 网络客户端：单例转发到 zhihu 请求栈，分页响应包装成 PaginatedResult。
import { getZhihuInstance } from '@/services/zhihu/module.js';

// 免登录端点（知乎日报等）使用的原始客户端：不经 zhihu 鉴权头与 401/403 处理分支
export { rawHttp } from '@/services/zhihu/transport.js';

class PaginatedResult {
	constructor(data, paging, options) {
		this._data = data;
		this.paging = paging || {
			next: null,
			previous: null,
			is_end: false,
		};
		this.options = options;
		this._consumed = false;
	}

	get data() {
		if (this._consumed) {
			throw new Error('PaginatedResult.data 已被消费');
		}

		this._consumed = true;
		const data = this._data;
		this._data = null;
		return data;
	}

	get hasMore() {
		return Boolean(this.paging) && !this.paging.is_end;
	}

	// 续取时按本次调用覆盖选项：signal 是一次性的，页面恢复后沿用上一次的会被直接 abort
	async next(overrides) {
		if (!this.paging.next) return null;
		const zhihuRequest = getZhihuInstance();
		const options = { ...this.options, ...overrides };
		const res = await zhihuRequest.get(this.paging.next, options);
		return new PaginatedResult(res.data, res.paging, options);
	}

	async prev(overrides) {
		if (!this.paging.previous) return null;
		const zhihuRequest = getZhihuInstance();
		const options = { ...this.options, ...overrides };
		const res = await zhihuRequest.get(this.paging.previous, options);
		return new PaginatedResult(res.data, res.paging, options);
	}
}

const httpMethods = {
	get(url, options) {
		const zhihuRequest = getZhihuInstance();
		return zhihuRequest.get(url, options).then(res =>
			(res.paging && typeof res.paging === 'object')
				? new PaginatedResult(res.data, res.paging, options)
				: res
		);
	},

	post(url, data, options) {
		const zhihuRequest = getZhihuInstance();
		return zhihuRequest.post(url, data, options).then(res => res);
	},

	patch(url, data, options) {
		const zhihuRequest = getZhihuInstance();
		return zhihuRequest.patch(url, data, options).then(res => res);
	},

	put(url, data, options) {
		const zhihuRequest = getZhihuInstance();
		return zhihuRequest.put(url, data, options).then(res => res);
	},

	delete(url, options) {
		const zhihuRequest = getZhihuInstance();
		return zhihuRequest.delete(url, options).then(res => res);
	},
};

export default httpMethods;