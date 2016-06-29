'use strict';
const joi = require('util/joi');
const permissionValidator = require('middleware/permissionValidator');
const requireSignature = require('middleware/requireSignature');
const Exception = require('util/exception');
const bodyParser = require('koa-bodyparser');
const queryValidator = require('middleware/queryValidator');
const User = require('runtime/db').User;
const _ = require('lodash');
const {IF, AND, OR} = permissionValidator;
const { ObjectId } = require('mongoose').Types;
const {SITE} = require('config');
const {NAME} = SITE;

module.exports = [
    bodyParser(),
    queryValidator({
        params: joi.object({
            _id: joi.id()
        }),
        query: joi.object({
            fields: joi.stringArray('profiles', 'roles', 'permissions', 'credentials')
        }) 
    }),
    permissionValidator(
        AND(
            'user.read',
            IF(
                (_0, _1, query) => (query.fields || '')
                                .split(',').indexOf('roles') !== -1,
                'user.role.read'
            ),
            IF(
                (_0, _1, query) => (query.fields || '')
                                .split(',').indexOf('permissions') !== -1,
                'user.permission.read'
            ),
            IF(
                (_0, _1, query) => (query.fields || '')
                                .split(',').indexOf('credentials') !== -1,
                'user.credential.read'
            )
        )
    ),


    function* (next) {
        const params = _.omitBy(this.params, v => v === undefined);
        const query = this.query;
        const user = this.user;
        const scope = user.scope;

        let fields = [];

        if (query.fields) {
            fields = query.fields.split(',');
        }
        let queryFilter = {};
        if (params._id) {
            queryFilter._id = new ObjectId(params._id);
        }

        const users = (yield User
                .detail(
                    queryFilter
                ))
                .map(user => {
                    let ret = {};
                    ret._id = user._id;
                    for (const field of fields) {
                        ret[field] = user[field];
                    }
                    return ret;
                });

        let adminProfileFlag = !! _.find(user.permissions, {
            scopeName: NAME,
            name: 'user.profile.read'
        });
        let adminCredentialFlag = !!_.find(user.permissions, {
            scopeName: NAME,
            name: 'user.credential.read'
        });
        let adminPermissionFlag = !!_.find(user.permissions, {
            scopeName: NAME,
            name: 'user.permission.read'
        });
        let adminRoleFlag = !!_.find(user.permissions, {
            scopeName: NAME,
            name: 'user.role.read'
        });

        let filteredUsers = users.map(user => {
            user.credentials = adminCredentialFlag ? user.credentials : [];
            if (user.profiles && !adminProfileFlag) {
                user.profiles = user.profiles.filter(p => 
                    p.application.equals(scope.scopeId));
            }
            if (user.permissions && !adminPermissionFlag) {
                user.permissions = user.permissions.filter(p => 
                    p.scopeId.equals(scope.scopeId));
            }
            if (user.roles && !adminRoleFlag) {
                user.roles = user.roles.filter(r => 
                    r.scopeId.equals(scope.scopeId));
            }
            return user;
        });
        this.resolve(filteredUsers);
        yield next; 
    }
];