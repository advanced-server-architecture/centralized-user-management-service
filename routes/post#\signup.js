'use strict';
const joi = require('util/joi');
const Exception = require('util/exception');
const queryValidator = require('middleware/queryValidator');
const User = require('runtime/db').User;
const config = require('config');
const md5 = require('util/encrypt').md5;
const _ = require('lodash');
const E = require('constant/E');
const requireSignature = require('middleware/requireSignature');
const redis = require('runtime/redis');
const Chance = require('chance');

module.exports = [
    queryValidator({
        body: joi.object({
            method: joi.string().allow('username', 'phone').required(),
            account: joi.switch('method', {
                    username: joi.string().required(),
                    phone: joi.string().regex(/^1[0-9]{10}$/).required()
                }),
            secret: joi.string().required()
        })
    }),
    requireSignature(),
    function* (next) {
        const body = this.request.body;
        const scope = this.scope;
        const count = yield User
                .count()
                .elemMatch('credentials', {
                    method: body.method,
                    account: body.account
                });
        if (count) {
            throw new Exception(E.USER.EXIST);
        }

        if (body.method === 'username') {
            let user = new User();

            user.credentials = [{
                method: body.method,
                account: body.account,
                secret: md5(`${config.CRYPT.SALT}-${body.secret}+${config.CRYPT.SALT}`),
                source: scope.scopeId
            }];

            yield user.save();
            this.resolve({
                _id: user._id
            });
        } else if (body.method === 'phone') {
            const key = config.ACTIVATE.PHONE.PREFIX + body.account;
            const chance = new Chance();
            const code = chance.string({
                    pool: config.ACTIVATE.PHONE.POOL,
                    length: config.ACTIVATE.PHONE.LENGTH
                });
            const expire = config.ACTIVATE.PHONE.EXPIRE;
            const validate = {
                code,
                source: scope.scopeId.toString(),
                account: body.account,
                secret: md5(`${config.CRYPT.SALT}-${body.secret}+${config.CRYPT.SALT}`),
                method: 'phone'                
            };
            // send text
            yield redis.setex(key, expire, JSON.stringify(validate));
            this.resolve(code);
        }

        yield next;
    }
]