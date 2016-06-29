'use strict';
const _ = require('lodash');

const ERROR = require('constant/ERROR');
const DEPTH = 5;
const START = '8';

function generateCode(error, prefix) {
    let result = {};
    let index = 0;
    for (const key in error) {
        const code = prefix + index.toString(); 
        if (typeof(error[key]) === 'string') {
            result[key] = START + _.padStart(code, DEPTH, '0');
        } else {
            result[key] = generateCode(error[key], code);
        }
        index++;
    }
    return result;
}

module.exports = generateCode(ERROR, '0');

