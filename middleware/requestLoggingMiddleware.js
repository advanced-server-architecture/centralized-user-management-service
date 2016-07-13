'use strict';
const logger = require('runtime/logger');
const uuid = require('util/uuid');

module.exports = function() {
    return function* (next) {
        const requestId = uuid();
        this.requestId = requestId;
        const {query, path,request} = this;
        const {body} = request;
        try {
            yield next;
            logger.info('request', requestId, path, query, body,
                    'response', this.body);
        } catch (e) {
            if (e.runtime) {
                this.reject(e.code, e.message, e.extra);
                logger.error('request', requestId, path, query, body,
                    'client-error', e);
            } else {
                logger.error('request', requestId, path, query, body,
                    'error', e);
                this.reject(500, 'Internal');
            }
        }
    };
}