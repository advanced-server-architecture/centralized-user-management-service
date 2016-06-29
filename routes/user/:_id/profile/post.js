'use strict';
const joi = require('util/joi');
const Exception = require('util/exception');
const bodyParser = require('koa-bodyparser');
const queryValidator = require('middleware/queryValidator');
const User = require('runtime/db').User;
const _ = require('lodash');
const requireSignature = require('middleware/requireSignature');
const E = require('constant/E');

module.exports = [
    bodyParser(),
    queryValidator({
        params: joi.object({
            _id: joi.id().required()
        }),
        body: joi.object().unknown()
    }),
    requireSignature(),
    function* (next) {
        const body = this.request.body;
        const scope = this.scope;

        const user = yield User
            .findOne({
                _id: this.params._id 
            }) 
            .exec();

        if (!user) {
            throw new Exception(E.USER.NOT_FOUND);
        }

        user.profiles = user.profiles.filter(
            p => !p.application.equals(scope.scopeId));

        user.profiles.push({
            application: this.scope.scopeId,
            metadata: body
        });

        yield user.save();
        this.resolve({
            _id: user._id,
            profiles: user.profiles.filter(
                p => p.application.equals(scope.scopeId))
        });
        yield next;
    }
]