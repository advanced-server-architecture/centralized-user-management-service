'use strict';
const joi = require('util/joi');
const Exception = require('util/exception');
const queryValidator = require('middleware/queryValidator');
const User = require('runtime/db').User;
const _ = require('lodash');
const requireSignature = require('middleware/requireSignature');
const E = require('constant/E');

const filterUser = require('util/filterUser');

module.exports = [
    queryValidator({
        params: joi.object({
            method: joi.string().allow('username').required(),
            account: joi.string().required()
        })
    }),
    requireSignature(),
    function* (next) {
        const scope = this.scope;
        const params = this.params;
        let user = (yield User
            .detail({
                'credentials': {
                    $elemMatch: params
                }
            }))[0];


        if (!user) {
            throw new Exception(E.USER.NOT_FOUND);
        }

        this.resolve(user._id);
        yield next;
    }
]