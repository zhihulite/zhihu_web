import {
	initZhihu,
	updateZhihuLoginData,
	getZhihuInstance
} from './utils/zhihu-module.js';

class PaginatedResult {
	constructor(data, paging, options) {
		this.data = data;
		this.paging = paging || {
			next: null,
			prev: null
		};
		this.options = options;
	}

	async next() {
		if (!this.paging.next) return null;
		const zhihuRequest = getZhihuInstance();
		const res = await zhihuRequest.get(this.paging.next, this.options);
		return new PaginatedResult(res.data, res.paging, this.options);
	}

	async prev() {
		if (!this.paging.prev) return null;
		const zhihuRequest = getZhihuInstance();
		const res = await zhihuRequest.get(this.paging.prev, this.options);
		return new PaginatedResult(res.data, res.paging, this.options);
	}
}

const httpMethods = {
	get(url, options = {}) {
		const zhihuRequest = getZhihuInstance();
		return zhihuRequest.get(url, options).then(res =>
			new PaginatedResult(res.data, res.paging, options)
		);
	},

	post(url, data = {}, options = {}) {
		const zhihuRequest = getZhihuInstance();
		return zhihuRequest.post(url, data, options).then(res => res.data);
	},

	patch(url, data = {}, options = {}) {
		const zhihuRequest = getZhihuInstance();
		return zhihuRequest.patch(url, data, options).then(res => res.data);
	},

	put(url, data = {}, options = {}) {
		const zhihuRequest = getZhihuInstance();
		return zhihuRequest.put(url, data, options).then(res => res.data);
	},

	delete(url, options = {}) {
		const zhihuRequest = getZhihuInstance();
		return zhihuRequest.delete(url, options).then(res => res.data);
	},
};


export {
	initZhihu,
	updateZhihuLoginData,
	getZhihuInstance
};
export default httpMethods;