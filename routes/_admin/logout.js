'use strict';

module.exports = [
    function* (next) {
        this.session = null;
        this.resolve([]);
        yield next; 
    }
];