'use strict';
const ip = require('util/ip')[0];

const pad = (str, length) => {
    let result = str;
    for (var i = 0; i < length - str.length; i++) {
        result = '0' + result;
    }
    return result;
}

module.exports = (extra) => { // 26
    const seg0 = Date.now().toString(16);  // epoch 11 
    //var  
    let seg1 = '';  // ip 8
    for (const ipSeg of ip.split('.')) {
        seg1 += pad(parseInt(ipSeg).toString(16), 2);
    }
    const seg2 = pad(process.pid.toString(16), 6)  // process id 6
    const seg3 = '0';
    if (extra && Number(extra)) {
        seg3 = extra.toString(16).substr(0, 1);
    }
    return seg0 + seg1 + seg2 + seg3;
}