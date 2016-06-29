'use strict';

module.exports = function(user, scope, flag) {
    return {
        profiles: user.profiles
                .filter(p => p.application.equals(scope.scopeId)),
        permissions: user.permissions,
        roles: user.roles,
        credentials: flag ? user.credentials : [],
        _id: user._id
    };
}