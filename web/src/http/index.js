import Superagent from 'superagent';
import { 
	baseUrl
} from '../../config';

let cookie = '';


const _Request = Superagent.Request;
class PromisedRequest extends _Request {
	constructor(method, url) {
		super(method, url);
	}
	end() {
		const self = this;
		return new Promise((resolve, reject) => {
			_Request.prototype.end.call(self, (err ,res) => {
				if (err) {
					err.response = res;
					reject(err);
				} else {
					const body = res.body;
					if (body.error) {
						reject(body.error[0]);
					} else {
						resolve(body.data);
					}
				}
			});
		});
	}	
	auth(token) {
		this.set('X-Authorization-Token', token);
		return this;	
	}
	then(resolve) {
		return this.end().then(resolve);
	}
	static options(url) {
		url = url.substr(0, 1) === '/' ? url : '/' + url;
		return new PromisedRequest('OPTIONS', baseUrl + url);
	}
	static get(url, data) {
		url = url.substr(0, 1) === '/' ? url : '/' + url;
		let req = new PromisedRequest('GET', baseUrl + url);
		if (data) {
			req = req.send(data);
		}
		return req.withCredentials();
	}
	static post(url, data) {
		url = url.substr(0, 1) === '/' ? url : '/' + url;
		let req = new PromisedRequest('POST', baseUrl + url);
		if (data) {
			req = req.send(data);
		}
		return req.withCredentials();
	}
	static put(url, data) {
		url = url.substr(0, 1) === '/' ? url : '/' + url;
		let req = new PromisedRequest('PUT', baseUrl + url);
		if (data) {
			req = req.send(data);
		}
		return req.withCredentials();
	}
	static patch(url, data) {
		url = url.substr(0, 1) === '/' ? url : '/' + url;
		let req = new PromisedRequest('PATCH', baseUrl + url);
		if (data) {
			req = req.send(data);
		}
		return req;
	}
	static delete(url, data) {
		url = url.substr(0, 1) === '/' ? url : '/' + url;
		return new PromisedRequest('DELETE', baseUrl + url);
	}
}
Superagent.Request = PromisedRequest;

export default PromisedRequest;