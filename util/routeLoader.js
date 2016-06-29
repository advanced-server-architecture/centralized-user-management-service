'use strict';

const fs = require('fs');
const Router = require('koa-router');
const path = require('path')
const logger = require('runtime/logger');

function walk(dir) {
    dir = path.resolve(__dirname, dir);
    const files = fs.readdirSync(dir);
    let list = [];
    for (const file of files) {
        if (fs.statSync(dir + '/' + file).isDirectory()) {
            list = list.concat(walk(dir + '/' + file));
        } else {
            list.push(dir + '/' + file);
        }
    }
    return list;
}

module.exports = function(dir) {
    dir = path.resolve(process.env.PWD, dir);
    dir = path.relative(__dirname, dir);
    const routes = walk(dir)
            .map(r => path.relative(__dirname, r))
            .sort((a, b) => a.length - b.length);

    const router = new Router();

    for (const route of routes) {
        let url = route;
        url = '/' + path.relative(dir, url);
        url = url.substr(0, url.length - 3)
        const paths = url.split('/');
        const name = paths[paths.length - 1].split('#');
        let method = name[0];
        
        let rest = '';
        if (name.length > 1) {
            paths.pop();
            url = paths.join('/');
            rest = '/' + method;
        }
        if (['post', 'get', 'put', 'del'].indexOf(method) !== -1) {
            const t = url.split('/');
            if (t[t.length - 1] === method) {
                t.pop();
                url = t.join('/');
            }
        } else {
            url += rest;
            method = 'get';
        }
        let query = name[1];
        const r = require(dir + '/' + route);
        if (query) {
            query = query.replace(/\\/g,'/');
            url = url + query;
        }
        logger.info('  ' + method + ' ' + url);
        router[method](url, ...r);
        
    }
    return router;
}