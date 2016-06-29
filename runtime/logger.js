'use strict';
const log4js = require('log4js');
const config = require('config')

log4js.configure({
    appenders: [{
        category: 'user-server',
        type: 'log4js-logstash',
        host: config.LOGSTASH.HOST,
        fields: {
            application: 'user-server',
            environment: config.ENV
        },
        port: config.LOGSTASH.PORT
    }, {
        category: 'console',
        type: 'console'
    }]
});


const logger = config.ENV === 'dev' ?
    log4js.getLogger('console') :
    log4js.getLogger('user-server');

module.exports = logger;