'use strict';
const joi = require('util/joi');
const Exception = require('util/exception');
const queryValidator = require('middleware/queryValidator');
const {User, Application} = require('runtime/db');
const config = require('config');
const md5 = require('util/encrypt').md5;
const E = require('constant/E');
const jwt = require('jsonwebtoken');
const redis = require('runtime/redis');
const _ = require('lodash');
const requireSignature = require('middleware/requireSignature');
const filterUser = require('util/filterUser');

module.exports = [
    queryValidator({
        body: joi.object({
            method: joi.string().allow('phone', 'username').required(),
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
        const user = (yield User
            .detail({
                'credentials': {
                    $elemMatch: {
                        method: body.method,
                        account: body.account,
                        secret: md5(`${config.CRYPT.SALT}-${body.secret}+${config.CRYPT.SALT}`)
                    }
                }
            }))[0];

        if (!user) {
            throw new Exception(E.AUTH.NO_USER_PASSWORD);
        }

        let scope = {}; 
        const app = yield Application
                    .findOne({ user })
                    .lean()
                    .exec();
        if (app) {
            scope = {
                scopeId: app._id.toString(),
                scopeName: app.name
            };
        }


        const expireAt = Date.now() + config.TOKEN.EXPIRE;
        const tokenKey = jwt.sign({
            _id: user._id.toString(),
        }, config.CRYPT.SALT, {
            expiresIn: config.TOKEN.EXPIRE
        });


        const filteredUser = filterUser(user, scope);

        const token = {
            _id: user._id.toString(),
            token: tokenKey,
            scope: JSON.stringify(scope),
            roles: JSON.stringify(filteredUser.roles),
            permissions: JSON.stringify(filteredUser.permissions),
            profiles: JSON.stringify(filteredUser.profiles)
        };

        const sessionKey = `${config.TOKEN.PREFIX}${token._id}`;
        yield redis.hmset(sessionKey, token);


        this.resolve({
            token: tokenKey,
            expireAt,
            user: filteredUser
        });

        yield next;
    }
]