'use strict';
const joi = require('util/joi');
const Exception = require('util/exception');
const bodyParser = require('koa-bodyparser');
const queryValidator = require('middleware/queryValidator');
const {User, Role} = require('runtime/db');
const _ = require('lodash');
const requireSignature = require('middleware/requireSignature');
const E = require('constant/E');
const filterUser = require('util/filterUser');

module.exports = [
    bodyParser(),
    queryValidator({
        params: joi.object({
            _id: joi.id().required()
        }),
        body: joi.array(joi.id().required())
    }),
    requireSignature(),
    function* (next) {
        const body = this.request.body;
        const scope = this.scope;
        const roles = yield Role
                    .find()
                    .where('_id').in(body)
                    .lean()
                    .exec();

        for (const role of roles) {
            if (role.scope !== 'global' &&
                !role.scopeId.equals(scope.scopeId)) {
                throw new Exception(E.ROLE.NOT_FOUND);
            }
        }

        const user = yield User
            .findOne({
                _id: this.params._id 
            }) 
            .exec();

        if (!user) {
            throw new Exception(E.USER.NOT_FOUND);
        }

        user.roles = user.roles.concat(body);
        user.roles = _.uniqBy(user.roles, r => r.toString());

        yield user.save();

        const filteredUser = filterUser(user, scope);
        this.resolve(filteredUser);
        yield next;
    }
]