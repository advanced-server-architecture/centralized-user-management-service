'use strict';
const session = require('koa-generic-session');
const redisStore = require('koa-redis');
const config = require('config');

module.exports = function(app) {
    app.keys = [config.CRYPT.SALT];
    return session({
        store: redisStore({
            url: config.REDIS_URI    
        }),
        key: config.SITE.NAME,
        prefix: config.SESSION.PREFIX + 'cookie:',
        cookie: {
            maxage: config.SESSION.EXPIRE * 1000
        },
    });
}