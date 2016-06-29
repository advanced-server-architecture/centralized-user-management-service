'use strict';
const Schema = require('mongoose').Schema;

module.exports = new Schema({
    permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
    name: String,
    scope: String,
    scopeId: Schema.Types.ObjectId
}, {
    collection: 'Role',
    timestamps: true,
    versionKey: false
});