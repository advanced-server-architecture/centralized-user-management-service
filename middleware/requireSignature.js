'use strict';

const Exception = require('util/exception');
const Application = require('runtime/db').Application;
const _ = require('lodash');
const signRequest = require('util/signRequest');
const config = require('config');


module.exports = function() {
    return function* (next) {
        const params = this.params;
        const query = this.query;
        const body = this.request.body;
        const header = this.headers;

        let token = {};
        if (this.headers['x-authorization-token']) {
            token['token'] = this.headers['x-authorization-token'];
        }

        const signBody = _.extend(token, params, query, body);
        try {
            signBody.timestamp = parseInt(header['x-timestamp']);
        } catch (e) {
            throw new Exception(403, 'Missing accessId or requestSignature');
        }
        const requestSignature = header['x-requestsignature'];
        const _id = header['x-accessid'];

        if (signBody.timestamp + config.CRYPT.SIGN.EXPIRE < Date.now()) {
            throw new Exception(403, 'Invalid Signature');
        }

        const app = yield Application
                        .findOne({ _id })
                        .select('accessSecret name')
                        .lean()
                        .exec();
        if (!app) {
            throw new Exception(403, 'Missing accessId or requestSignature');
        }
        const signature = signRequest(signBody, app.accessSecret);

        if (requestSignature !== signature) {
            throw new Exception(403, 'Invalid Signature');
        }
        
        this.scope = this.scope || {
            scope: 'application',
            scopeId: app._id,
            scopeName: app.name
        };

        yield next;
    }
}