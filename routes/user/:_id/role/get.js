'use strict';
const joi = require('util/joi');
const Exception = require('util/exception');
const queryValidator = require('middleware/queryValidator');
const User = require('runtime/db').User;
const _ = require('lodash');
const { ObjectId } = require('mongoose').Types;
const filterUser = require('util/filterUser');
const userMiddleware = require('routeMiddlewares/user');

module.exports = [
    queryValidator({
        params: joi.object({
            _id: joi.id().required()
        })
    }),
    ...userMiddleware,
    function* (next) {
        const scope = this.scope;

        const user = (yield User
            .detail({
                _id: new ObjectId(this.params._id)
            }))[0];

        if (!user) {
            throw new Exception(404);
        }

        const filteredUser = filterUser(user, scope);

        this.resolve(filteredUser);

        yield next;
    }
]