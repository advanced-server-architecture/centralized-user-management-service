'use strict';

module.exports = [
    function* (next) {
        console.log(this.user)
        yield next;
    }
];