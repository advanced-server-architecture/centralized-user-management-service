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
const requestLoggingMiddleware = require('middleware/requestLoggingMiddleware');
const sessionMiddleware = require('middleware/session');
const bodyParser = require('koa-bodyparser');
const app = koa();


app.use(bodyParser());
app.use(commonMiddleware);
app.use(requestLoggingMiddleware());
app.use(sessionMiddleware(app));

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
