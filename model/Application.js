'use strict';
const Schema = require('mongoose').Schema;

module.exports = new Schema({
    accessSecret: String,
    name: String,
    user: { type: Schema.Types.ObjectId, ref: 'User'}
}, {
    collection: 'Application',
    timestamps: true,
    versionKey: false
});