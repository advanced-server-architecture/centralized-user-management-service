'use strict';
const Schema = require('mongoose').Schema;

module.exports = new Schema({
    name: String,
    scope: String,
    scopeId: Schema.Types.ObjectId
}, {
    collection: 'Permission',
    timestamps: true,
    versionKey: false
});