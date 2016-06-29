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
            result[START + _.padStart(code, DEPTH, '0')] = error[key];
        } else {
            result = _.extend(result, generateCode(error[key], code))
        }
        index++;
    }
    return result;
}

const errors = _.extend({
    '422': '请求格式错误',
    '421': '请求冲突(存在重复记录)',
    '403': '没有相应的请求权限',
    '401': '认证失败'
}, generateCode(ERROR, ''));

function Exception(code, extra) {
    this.code = code;
    this.message = errors[code.toString()] || 'Unknown Error';
    this.runtime = true;
    this.exception = true;
    this.stack = (new Error()).stack;
    this.extra = extra;
}


module.exports = Exception;
