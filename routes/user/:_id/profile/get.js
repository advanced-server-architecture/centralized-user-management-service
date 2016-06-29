'use strict';
const joi = require('util/joi');
const Exception = require('util/exception');
const queryValidator = require('middleware/queryValidator');
const User = require('runtime/db').User;
const _ = require('lodash');
const requireSignature = require('middleware/requireSignature');

module.exports = [
    queryValidator({
        params: joi.object({
            _id: joi.id().required()
        })
    }),
    requireSignature(),
    function* (next) {
        const scope = this.scope;

        const user = yield User
            .findOne({
                _id: this.params._id 
            }) 
            .select('profiles _id')
            .lean()
            .exec();

        if (!user) {
            throw new Exception(404);
        }

        this.resolve({
            _id: user._id,
            profiles: user.profiles.filter(
                p => p.application.equals(scope.scopeId))
        });

        yield next;
    }
]