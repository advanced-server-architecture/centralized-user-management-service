import superagent from 'superagent';
import {
	baseUrl
} from '../../config';

const methods = {
    'del': 'DELETE',
    'get': 'GET',
    'put': 'PUT',
    'post': 'POST'
};

const _Request = superagent.Request;
class Request extends _Request {
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
					if (body.error &&
                        body.error.length > 0) {
						reject(body.error[0]);
					} else {
						resolve(body.data);
					}
				}
			});
		});
	}
	then(resolve) {
		return this.end().then(resolve);
	}
}

function prefix(url) {
    return function(request) {
        if (request.url[0] === '/') {
            request.url = prefix + request.url;
        }
    }
}

for (const method in methods) {
    Request[method] = function(url) {
        if (url[0] === '/') {
            url = baseUrl + url;
        }
        let req = new Request(methods[method], url);
        return req.withCredentials();
    }
}


superagent.Request = Request;

export default Request;
