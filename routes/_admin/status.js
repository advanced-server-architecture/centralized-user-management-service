'use strict';
const Exception = require('util/exception');

module.exports = [
    function* (next) {
        if (!this.session.login) {
            throw new Exception(401)
        }

        const user = this.session.login.user
        this.resolve({
            _id: user._id
        });
        yield next; 
    }
];