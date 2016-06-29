'use strict';

const joi = require('util/joi');
const Exception = require('util/exception');
const bodyParser = require('koa-bodyparser');
const queryValidator = require('middleware/queryValidator');
const config = require('config');
const _ = require('lodash');
const signRequest = require('util/signRequest');

const request = require('superagent');

module.exports = [
    bodyParser(),
    queryValidator({
        body: joi.object({
            username: joi.string().required(),
            password: joi.string().required() 
        })
    }),
    function* (next) {
        const body = this.request.body;
        const timestamp = Date.now();
        const requestBody = {
            method: 'username',
            account: body.username,
            secret: body.password
        };
        const result = yield cb => request
                .post(`http://localhost:${config.HTTP_PORT}/authorize`)
                .send(requestBody)
                .set('X-AccessId', config.SITE.ACCESS_ID)
                .set('X-TimeStamp', timestamp)
                .set('X-RequestSignature', 
                    signRequest(_.extend({
                        timestamp: timestamp
                    }, requestBody), config.SITE.ACCESS_SECRET))
                .end(cb)
        const loginResult = result.body  ;
        if (loginResult.error) {
            const error = loginResult.error[0];
            throw new Exception(error.code, error.extra);
        }
        this.resolve(loginResult.data[0]);
    }
];