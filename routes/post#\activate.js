'use strict';
const joi = require('util/joi');
const Exception = require('util/exception');
const queryValidator = require('middleware/queryValidator');
const User = require('runtime/db').User;
const config = require('config');
const md5 = require('util/encrypt').md5;
const _ = require('lodash');
const requireSignature = require('middleware/requireSignature');
const redis = require('runtime/redis');
const Chance = require('chance');
const E = require('constant/E');

module.exports = [
    queryValidator({
        body: joi.object({
            method: joi.string().allow('phone').required(),
            account: joi.switch('method', {
                    username: joi.string().required(),
                    phone: joi.string().regex(/1[0-9]{10}/).required()
                }),
            code: joi.switch('method', {
                    phone: joi.string(
                            new RegExp(`[${config.ACTIVATE.PHONE.POOL}]` +
                                        `{${config.ACTIVATE.PHONE.LENGTH}}`)
                        ).required()
                })
        })
    }),
    requireSignature(),
    function* (next) {
        const body = this.request.body;
        const scope = this.scope;
        const prefix = ((method) => {
            switch (method) {
                case 'phone':
                    return config.ACTIVATE.PHONE.PREFIX;
            }
        })(body.method);

        const validate = yield redis.get(prefix + body.account);
        if (!validate) {
            throw new Exception(ACTIVATION_CODE_ERROR);
        }

        let user = new User();
        const u =JSON.parse(validate);
        if (u.code !== body.code) {
            throw new Exception(ACTIVATION_CODE_ERROR);
        }
        yield redis.del(prefix + body.account);

        user.credentials = [{
            method: u.method,
            account: u.account,
            secret: u.secret,
            source: scope.scopeId
        }];

        yield user.save();
        this.resolve({
            _id: user._id
        });
        yield next;
    }
]