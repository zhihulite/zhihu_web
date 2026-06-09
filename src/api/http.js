import {
	initZhihu,
	updateZhihuLoginData,
	getZhihuInstance
} from './utils/zhihu-module.js';

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

	async next() {
		if (!this.paging.next) return null;
		const zhihuRequest = getZhihuInstance();
		const res = await zhihuRequest.get(this.paging.next, this.options);
		return new PaginatedResult(res.data, res.paging, this.options);
	}

	async prev() {
		if (!this.paging.previous) return null;
		const zhihuRequest = getZhihuInstance();
		const res = await zhihuRequest.get(this.paging.previous, this.options);
		return new PaginatedResult(res.data, res.paging, this.options);
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


export {
	initZhihu,
	updateZhihuLoginData,
	getZhihuInstance
};
export default httpMethods;