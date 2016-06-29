'use strict';
const Schema = require('mongoose').Schema;
const _ = require('lodash');

const schema = new Schema({
    credentials: [{
        method: String,
        account: String,
        secret: String,
        source: { type: Schema.Types.ObjectId, ref: 'Application'},
        _id: false
    }],
    profiles: [{
        metadata: Schema.Types.Mixed,
        application: { type: Schema.Types.ObjectId, ref: 'Application'},
        _id: false
    }],
    roles: [{ type: Schema.Types.ObjectId, ref: 'Role'}],
    permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission'}],
}, {
    collection: 'User',
    timestamps: true,
    versionKey: false
});

schema.statics.detail = function($match) {
    return new Promise((resolve, reject) => {
        this
            .aggregate({
                $match
            },{
                $unwind: {
                    path: '$permissions',
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $lookup: {
                    from: 'Permission',
                    localField: 'permissions',
                    foreignField: '_id',
                    as: 'permissions'
                }
            }, {
                $unwind: {
                    path: '$roles',
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $lookup: {
                    from: 'Role',
                    localField: 'roles',
                    foreignField: '_id',
                    as: 'roles'
                }
            }, {
                $unwind: {
                    path: '$roles',
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $unwind: {
                    path: '$roles.permissions',
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $lookup: {
                    from:'Permission',
                    localField: 'roles.permissions',
                    foreignField: '_id',
                    as: 'permissionList'
                }
            }, {
                $project: {
                    updatedAt: 1,
                    createdAt: 1,
                    profiles: 1,
                    roles: 1,
                    permissions: {
                        $setUnion: ['$permissions', '$permissionList']
                    },
                    credentials: 1
                }
            })
            .exec()
            .then(result => {
                const list = _.groupBy(result, '_id')
                let users = [];

                for (const _id in list) {
                    const userItems = list[_id]
                    const user = {
                        _id,
                        updatedAt: userItems[0].updatedAt,
                        createdAt: userItems[0].createdAt,
                        profiles: _.uniqBy(
                            userItems
                                .reduce((l, r) => l.concat(r.profiles), [])
                            , r => r.application.toString()),
                        roles: _.uniqBy(
                            userItems
                                .map(r => r.roles && _.omit(
                                    r.roles, 
                                    'createdAt', 
                                    'updatedAt', 
                                    'permissions')
                                )
                                .filter(r => r !== undefined &&
                                            r != {})
                            , r => r._id.toString()),
                        permissions: _.uniqBy(
                           userItems
                            .reduce((l, r) => l
                                .concat(r.permissions), []), r => r._id.toString())
                            .map(p => _.omit(p, 'createdAt', 'updatedAt')),
                        credentials: userItems[0].credentials
                    }; 
                    users.push(user);
                }

                resolve(users)
            })
            .catch(reject)
    });
};


module.exports = schema;