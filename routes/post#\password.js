'use strict';
const joi = require('util/joi');
const Exception = require('util/exception');
const queryValidator = require('middleware/queryValidator');
const {User, Application} = require('runtime/db');
const config = require('config');
const md5 = require('util/encrypt').md5;
const E = require('constant/E');
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
            secret: joi.string().required(),
            newSecret: joi.string().required(),
        })
    }),
    requireSignature(),
    function* (next) {
        const body = this.request.body;
        let user = (yield User
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

        user = yield User
                .findOne({
                    _id: user._id,
                })
                .exec();

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

        const index = _.findIndex(user.credentials, {
            method: body.method,
            account: body.account,
        });

        user.crendentials[index].secret = md5(`${config.CRYPT.SALT}-${body.newSecret}+${config.CRYPT.SALT}`);
        yield user.save();

        const filteredUser = filterUser(user, scope);

        this.resolve({
            user: filteredUser
        });

        yield next;
    }
]