'use strict';
const Exception = require('util/exception');
const redis = require('runtime/redis');
const config = require('config');
const jwt = require('jsonwebtoken');

module.exports = function(...paths) {
    return function* (next) {
        if (paths.indexOf(`${this.method} ${this.path}`) !== -1) {
            return yield next;
        }
        if (this.path.substr(0, 7) !== '/_admin') {
            return yield next;
        }
        for (const p of paths) {
            const [method, path] = p.split(' ');
            if (method === this.method) {
                const length = path.length;
                if (this.path.substr(0, length) === path) {
                    return yield next;
                }
            }
        }

        let tokenKey;
        if (this.query.authenticationToken) {
            tokenKey = this.query.authenticationToken;
        }
        if (this.headers && this.headers['x-authorization-token']) {
            tokenKey = this.headers['x-authorization-token'];
        }
        if (!tokenKey) {
            throw new Exception(401);
        }
        let token;
        try {
            token = jwt.verify(tokenKey, config.CRYPT.SALT);
        } catch (e) {
            throw new Exception(401);
        }
        const session = yield redis.hgetall(`${config.TOKEN.PREFIX}${token._id}`);
        if (tokenKey !== session.token) {
            throw new Exception(401);
        }
        this.user = {
            _id: token._id,
            scope: JSON.parse(session.scope),
            roles: JSON.parse(session.roles),
            permissions: JSON.parse(session.permissions)
        };
        this.scope = this.user.scope;
        yield next;
    };
};