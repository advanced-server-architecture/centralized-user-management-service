'use strict';
const encrypt = require('util/encrypt');

module.exports = function(params, secret) {
    let paramArray = [];
    const keys = Object.keys(params).sort();
    for (const key of keys) {
        paramArray.push(`${key}=${String(params[key])}`);
    }
    const paramString = paramArray.join('&') + secret;
    return encrypt.md5(paramString);
}