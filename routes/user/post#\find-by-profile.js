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
        body: joi.object().unknown()
    }),
    requireSignature(),
    function* (next) {
        const scope = this.scope;
        const body = this.request.body;


        let $elemMatch = {
            application: scope.scopeId,
        }

        for (const key in body) {
            $elemMatch[`metadata.${key}`] = body[key];
        }

        const users = (yield User
            .detail({
                'profiles': {
                    $elemMatch         
                }
            }));

        const filteredUsers = users.map(user => filterUser(user, scope));
        this.resolve(filteredUsers);
        yield next;
    }
]