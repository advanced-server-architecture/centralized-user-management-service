'use strict';
const config = require('config');
const MongoClient = require('mongodb').MongoClient;
const models = require('runtime/db');
const md5 = require('util/encrypt').md5;
const secret = require('util/secret');
const signRequest = require('util/signRequest');
const fs = require('fs');
const path = require('path')
const projectRoot = path.resolve(__dirname, '../');
const prompt = require('inquirer');

module.exports = function* () {

    const permissionList = [
        'user.read',
        'user.create',
        'user.modify',
        'user.delete',
        'user.permission.read',
        'user.permission.create',
        'user.permission.modify',
        'user.role.read',
        'user.role.create',
        'user.role.modify',
        'user.credential.read',
        'user.credential.create',
        'user.credential.modify',
    ];

    console.log('---------- test.js -----------');
    const db = yield MongoClient.connect(config.MONGODB);
    console.log('Connected');

    let app;


    {
        app = new models.Application();
        app.accessSecret = secret();
        app.name = 'cums-test-application';
        yield app.save();

        console.log('Test Application created');
        console.log(`\taccessId: ${app._id.toString()}`);
        console.log(`\taccessSecret: ${app.accessSecret.toString()}`);
        console.log(`\tname: ${app.name}`);
    }


    let userPermissions = [];

    for (const permission of permissionList) {
        const userPermission = new models.Permission();
        userPermission.name = permission;
        userPermission.scope = 'application';
        userPermission.scopeId = app;
        yield userPermission.save();
        userPermissions.push(userPermission);
        console.log(`permission ${permission} created`);
    }

    {
        const userRole = new models.Role();
        userRole.name = 'test-application-admin';
        userRole.scope = 'application';
        userRole.scopeId = app;
        userRole.permissions = userPermissions;
        yield userRole.save();
        console.log('test application admin role created');

        console.log(' creating test user');
        const input = yield prompt.prompt([{
            type: 'input', 
            message: 'test username:',
            name: 'account'
        }, {
            type: 'password', 
            message: 'test password:',
            name: 'secret'
        }]);
        const account = input.account;
        const secret = input.secret;

        const user = new models.User();
        user.credentials = [{
            method: 'username',
            account,
            secret: md5(config.CRYPT.SALT + 
                    '-' + secret + '+' + 
                    config.CRYPT.SALT)
        }];
        user.roles = [userRole];
        user.profiles = [{
            application: app,
            metadata: {
            }
        }];
        yield user.save();
        app.user = user;
        yield app.save();
        console.log('user created');
    }

    fs.writeFileSync(projectRoot + '/config.js', 
        'module.exports = ' + JSON.stringify(config, 0, 4) + ';\n');

    db.close();
}
