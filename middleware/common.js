'use strict';
const url = require('url');
const xml = require('js2xmlparser');

const formats = [
    'json',
    'xml'
];

module.exports = function* (next) {

    this.output_format = 'json';
    {
        let path = this.path;
        let  t = path.split('.');
        if (formats.indexOf(t[t.length - 1]) !== -1) {
            this.output_format = t.pop();
            this.path = t.join('.')
        }
    }

    {
        const parsed = url.parse(this.url)
        let path = parsed.pathname;
        let t = path.split('.');
        if (formats.indexOf(t[t.length - 1]) !== -1) {
            this.output_format = t.pop();
            path = t.join('.')
        }
        this.url = path + (parsed.search || '');
    }

    this.send = (body) => {
        body.requestId = this.requestId;
        switch (this.output_format) {
            case 'json':
                this.type = 'json';
                this.body = JSON.stringify(body);
                break;
            case 'xml':
                body = JSON.parse(JSON.stringify(body));
                this.type = 'xml';
                this.body = xml('response', body);
                break;
        }
        this.status = 200;
    };

    this.resolve = (result) => {
        result = !result ? [] : Array.isArray(result) ? result : [result];
        this.send({
            data: result
        });
    };

    this.reject = (code, message, extra) => {
        let error = {
            code, 
            message
        };

        if (extra) {
            error.extra = extra;
        }

        this.send({
            error: [error]
        });
    };
    if (this.method === 'OPTIONS') {
        this.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        this.set('Access-Control-Allow-Headers', 'Content-Type, Cookie');
    }
    this.set('Access-Control-Allow-Credentials', 'true');
    this.set('Access-Control-Allow-Origin', this.headers['origin'] || '');
    yield next;
}