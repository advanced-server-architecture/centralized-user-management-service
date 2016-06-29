'use strict';

const User = require('runtime/db').User;
const _ = require('lodash');
const requireSignature = require('middleware/requireSignature');

module.exports = [
    requireSignature(),
    function* (next) {
        const scope = this.scope;
        const users = yield User
            .detail({});
   
        const filteredUsers = users
            .map(user => {
                user.profiles = 
                    user.profiles
                        .filter(p => p.application.equals(scope.scopeId));
                user.permissions = 
                    user.permissions
                        .filter(p => p.scopeId.equals(scope.scopeId) || 
                                p.scope === 'gloabl');
                user.roles = 
                    user.roles
                        .filter(p => p.scopeId.equals(scope.scopeId) || 
                            p.scope === 'gloabl');
                return user;
            });
        this.resolve(filteredUsers);

        yield next;
    }
]