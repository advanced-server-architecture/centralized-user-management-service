'use strict';
const redis = require('redis');
const config = require('config');

const redisClient = require('co-redis')(redis.createClient(config.REDIS_URI));

module.exports = redisClient;