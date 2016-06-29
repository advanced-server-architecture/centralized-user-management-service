'use strict';
require('app-module-path/register');
const koa = require('koa');
const config = require('config');
const logger = require('runtime/logger');
const db = require('runtime/db');
const co = require('co');
const _ = require('lodash');
const routeLoader = require('util/routeLoader');
const commonMiddleware = require('middleware/common');
const requireAuthMiddleware = require('middleware/requireAuthMiddleware');
const requestLoggingMiddleware = require('middleware/requestLoggingMiddleware');

const app = koa();


app.use(commonMiddleware);
app.use(function* (next) {
    try {
        yield next;
    } catch (e) {
        if (e.runtime) {
            this.reject(e.code, e.message, e.extra);
        } else {
            logger.error(e);
            this.reject(500, 'Internal');
        }
    }
});

app.use(requireAuthMiddleware(
    'POST /_admin/login'
));

const router = routeLoader('./routes');

app.use(router.routes());
app.use(router.allowedMethods());


app.listen(config.HTTP_PORT, err => {
    if (err) {
        logger.error(err);
        process.exit(1);
    }
    logger.info(`Server started on port:${config.HTTP_PORT}`);
});

require('websocket');