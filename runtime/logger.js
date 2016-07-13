'use strict';
const log4js = require('log4js');
const config = require('config')
const Logstash = require('logstash-client');

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

const client = new Logstash({
    type: 'tcp',
    host: config.LOGSTASH.HOST,
    port: config.LOGSTASH.PORT
});

const consoleLogger = log4js.getLogger('console');

function appender(e) {
    const {data, startTime} = e;
    const level = e.level.levelStr;
    consoleLogger[level.toLowerCase()](...data);
    const type = data[0];
    let log = {
        '@server': 'cums',
        '@env': config.ENV,
        '@date': startTime,
        '@type': type,
        '@level': level
    };
    switch (type) {
        case 'request': {
            const [_0, requestId, path, query, body, requestType, content] = data;
            log['@requestId'] = requestId;
            log['@path'] = path;
            log['@query'] = JSON.stringify(query);
            log['@body'] = JSON.stringify(body);
            log['@requestType'] = requestType;
            log['@content'] = content;
            break;
        }
        default:
            log['@type'] = 'un-classified';
            log['@message'] = data[0]
            break;
    }
    client.send(log);
}
log4js.addAppender(appender, 'remote');

const remoteLogger = log4js.getLogger('remote');

const logger = config.ENV === 'dev' ?
    consoleLogger :
    remoteLogger

module.exports = logger;