'use strict';
const crypto = require('crypto');

module.exports = {
    md5(str) {
        return crypto.createHash('md5').update(str).digest('hex');
    },
    encrypt(salt, source) {
        salt = crypto.createHash('md5').update(salt).digest('hex');
        const iv = crypto.createHash('md5').update(salt.substr(0, salt.length / 2)).digest('hex').substr(0, 16);
        const cipher = crypto.createCipheriv('aes-256-cbc', salt, iv);
        const crypted = cipher.update(source, 'utf8', 'hex');
        return crypted + cipher.final('hex');
    },
    decrypt(salt, target) {
        salt = crypto.createHash('md5').update(salt).digest('hex');
        const iv = crypto.createHash('md5').update(salt.substr(0, salt.length / 2)).digest('hex').substr(0, 16);
        const decipher = crypto.createDecipheriv('aes-256-cbc', salt, iv);
        const dec = decipher.update(target, 'hex', 'utf8');
        return dec + decipher.final('utf8');
    },
    encode(salt, text) {
        const buf = new Buffer(text, 'utf8');
        salt = new Buffer(salt, 'utf8');
        const result = [];
        const length = salt.length;
        for (const i = 0; i < buf.length; i++) {
            result.push(buf[i] ^ salt[i % length]);
        }
        return new Buffer(result).toString('base64');
    },
    decode(salt, text) {
        const buf = new Buffer(text, 'base64');
        salt = new Buffer(salt, 'utf8');
        const result = [];
        const length = salt.length;
        for (const i = 0; i < buf.length; i++) {
            result.push(buf[i] ^ salt[i % length]);
        }
        return new Buffer(result).toString('utf8');
    }
}