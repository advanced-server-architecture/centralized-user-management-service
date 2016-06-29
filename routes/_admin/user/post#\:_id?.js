'use strict';
const joi = require('util/joi');
const Exception = require('util/exception');
const bodyParser = require('koa-bodyparser');
const queryValidator = require('middleware/queryValidator');
const requireSignature = require('middleware/requireSignature');
const User = require('runtime/db').User;
const Application = require('runtime/db').Application;
const Role = require('runtime/db').Role;
const Permission = require('runtime/db').Permission;
const _ = require('lodash');
const permissionValidator = require('middleware/permissionValidator');
const {IF, AND, OR} = permissionValidator;

module.exports = [
    bodyParser(),
    queryValidator({
        params: joi.object({
            _id: joi.id()
        }),
        body: joi.object({
            credentials: joi.array().items(joi.object({
                method: joi.string().allow('phone', 'username').required(),
                account: joi.string().required(),
                password: joi.string().required()
            })),
            profiles: joi.array().items(joi.object({
                application: joi.id().required(),
                metadata: joi.any()
            })),
            roles: joi.array().items(joi.id().required()),
            permissions: joi.array().items(joi.id().required()),
        }),
        query: joi.object({
            fields: joi.stringArray('profiles', 'roles', 'permissions', 'credentials')
        })
    }),
    permissionValidator(
        AND(

            IF(
                (_0, params) => !!params._id,
                'cums-admin-site#user.create',
                'cums-admin-site#user.modify'
            ),
            IF(
                (_0, _1, _2, body) => Array.isArray(body.permissions),
                IF(
                    (_0, params) => !!params._id,
                    'cums-admin-site#user.permission.create',
                    'cums-admin-site#user.permission.modify'
                )
            ),
            IF(
                AND(
                    (_0, _1, _2, body) => Array.isArray(body.roles),
                    function* (user, _1, _2, body) {
                        const count = yield Role
                            .count()
                            .where('_id').in(body.roles)
                            .lean()
                            .exec();
                        if (count !== body.roles.length) {
                            throw new Exception(404, 'role(s) not found');
                        }
                        return true;
                    }
                ),
                IF(
                    (_0, params) => !!params._id,
                    'cums-admin-site#user.role.create',
                    'cums-admin-site#user.role.modify'
                )
            ),
            IF(
                AND(
                    (_0, _1, _2, body) => Array.isArray(body.credentials),
                    function* (_0, _1, _2, body) {
                        for (const credential of body.credentials) {
                            const result = yield User
                                .findOne()
                                .select('_id')
                                .elemMatch('credentials', {
                                    method: credential.method,
                                    account: credential.account,
                                })
                                .lean()
                                .exec();
                            if (result._id !== user._id) {
                                yield new Exception(421, 
                                    `Account ${credential.method}#${credential.account} existed`);
                            }
                        }
                        return true;
                    }
                ),
                IF(
                    (_0, params) => !!params._id,
                    'cums-admin-site#user.credential.create',
                    'cums-admin-site#user.credential.modify'
                )
            ),
            IF(
                (_0, _1, _2, body) => Array.isArray(body.profiles),
                OR(
                    IF(
                        (_0, params) => !!params._id,
                        'cums-admin-site#user.profile.create',
                        'cums-admin-site#user.profile.modify'
                    )
                )
            ),
            IF(
                (_0, _1, query) => (query.fields || '')
                                .split(',').indexOf('roles') !== -1,
                'cums-admin-site#user.role.read'
            ),
            IF(
                (_0, _1, query) => (query.fields || '')
                                .split(',').indexOf('permissions') !== -1,
                'cums-admin-site#user.permission.read'
            ),
            IF(
                (_0, _1, query) => (query.fields || '')
                                .split(',').indexOf('credentials') !== -1,
                'cums-admin-site#user.credential.read'
            )
        )
    ),

    function* (next) {
        let user;
        const params = this.params;
        const body = this.request.body;
        if (params._id) {
            user = yield User
                .findOne(params)
                .exec();
        } else {
            user = new User();
        }

        if (body.credentials) {
            user.credentials = body.credentials;
        }

        if (body.profiles) {
            const ids = body.profiles.map(p => p.application);
            const count = yield Application
                        .count()
                        .where('_id').in(ids)
                        .lean()
                        .exec();
            if (count !== ids.length) {
                throw new Exception(404, 'application(s) not found');
            }
            user.profiles = body.profiles;
        }

        if (body.roles) {
            
            user.roles = body.roles;
        }

        if (body.permissions) {
            const count = yield Permission
                        .count()
                        .where('_id').in(body.permissions)
                        .lean()
                        .exec();
            if (count !== body.permissions.length) {
                throw new Exception(404, 'permission(s) not found');
            }
            user.permissions = body.permissions;
        }

        yield user.save();
        let filteredUser = {};
        filteredUser._id = user._id;
        if (this.query.fields) {
            for (const field of this.query.fields.split(',')) {
                filteredUser[field] = user[field];
            }
        }
        this.resolve(filteredUser);
        yield next; 
    }
];