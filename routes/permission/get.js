'use strict';
const Permission = require('runtime/db').Permission;
const requireSignature = require('middleware/requireSignature');

module.exports = [
    requireSignature(),
    function* (next) {
        const sign = this.sign;

        const permissions = yield Permission
            .find({
                scopeId: sign.scopeId
            })
            .exec();

        this.resolve(permissions);
        yield next;
    }
]