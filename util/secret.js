'use strict';

const Chance = require('chance');
const config = require('config');

module.exports = function() {
    const chance = new Chance();
    return chance
        .string({
            pool: config.CRYPT.SECRET.POOL,
            length: chance.integer({
                min: config.CRYPT.SECRET.MIN,
                max: config.CRYPT.SECRET.MAX
            })
        });
}
