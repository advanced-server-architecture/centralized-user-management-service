'use strict';

const joi = require('util/joi');
const Exception = require('util/exception');
const queryValidator = require('middleware/queryValidator');
const config = require('config');
const _ = require('lodash');
const signRequest = require('util/signRequest');
const request = require('superagent');

module.exports = [
    queryValidator({
        body: joi.object({
            method: joi.string().allow('phone', 'username').required(),
            account: joi.switch('method', {
                    username: joi.string().required(),
                    phone: joi.string().regex(/^1[0-9]{10}$/).required()
                }),
            secret: joi.string().required()
        })
    }),
    function* (next) {
        const body = this.request.body;
        const timestamp = Date.now();
        const getLoginResult = yield cb => request
                .post(`http://localhost:${config.HTTP_PORT}/authorize`)
                .send(body)
                .set('X-AccessId', config.SITE.ACCESS_ID)
                .set('X-TimeStamp', timestamp)
                .set('X-RequestSignature', 
                    signRequest(_.extend({
                        timestamp: timestamp
                    }, body), config.SITE.ACCESS_SECRET))
                .end(cb);

        const loginResult = getLoginResult.body;
        if (loginResult.error) {
            const error = loginResult.error[0];
            throw new Exception(error.code, error.extra);
        }
        const login = loginResult.data[0];
        const user = login.user;

        const getProfileResult = yield cb => request
                .get(`http://localhost:${config.HTTP_PORT}/user/${user._id}/profile`)
                .set('X-AccessId', config.SITE.ACCESS_ID)
                .set('X-TimeStamp', timestamp)
                .set('X-Authorization-Token', login.token)
                .set('X-RequestSignature', 
                    signRequest(_.extend({
                        timestamp: timestamp
                    }), config.SITE.ACCESS_SECRET))
                .end(cb);

        const profileResult = getProfileResult.body;
        if (profileResult.error) {
            const error = profileResult.error[0];
            throw new Exception(error.code, error.extra);
        }

        const profile = profileResult.data[0];

        yield this.regenerateSession();
        this.session.login = login;
        this.resolve(_.extend({
            _id: user._id
        }, profile));
    }
];