'use strict';
const joi = require('joi');
const _ = require('lodash');

joi.id = () => joi.string().hex().length(24);

const _multi = (ref, current, remain, fail) => {
    let opts = {
        is: current.key,
        then: current.value,
        otherwise: fail
    };
    if (remain.length > 0) {
        const curr = remain.pop();
        opts.otherwise = _multi(ref, curr, remain, fail);
    }
    return joi.alternatives().when(ref, opts);
};

joi.switch = (ref, cond, fail) => {
    fail = fail || joi.forbidden();
    const arr = [];
    for (var key in cond) {
        arr.push({key, value: cond[key]});
    }
    const curr = arr.pop();
    return _multi(ref, curr, arr, fail);
};

function strip(char) {
    const chars = [].concat( 
                _.range(48, 58)
                    .map(i => String.fromCharCode(i)),
                _.range(65, 91)
                    .map(i => String.fromCharCode(i)),
                _.range(97, 123)
                    .map(i => String.fromCharCode(i))
                )
    if (chars.indexOf(char) === -1) {
        return '\\' + char;
    }
    return char;
}

joi.stringArray = (...items) => {
    const words = '(' + items
        .map(i => i.split('').map(c => strip(c)).join(''))
        .join('|') + ')';
    const regexString = `^${words}(,${words})*$`;
    const regex = new RegExp(regexString);
    return joi.string().regex(regex);
};

module.exports = joi;