'use strict';
let config = require('config');
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

    console.log('---------- db.js -----------');
    const db = yield MongoClient.connect(config.MONGODB);
    console.log('Connected');

    yield db.collection('Permission').deleteMany({});
    console.log('Cleaned Permission');

    yield db.collection('Role').deleteMany({});
    console.log('Cleaned Role');

    yield db.collection('User').deleteMany({});
    console.log('Cleaned User');

    yield db.collection('Application').deleteMany({});
    console.log('Cleaned Application');


    let app;


    {
        app = new models.Application();
        app.accessSecret = secret();
        app.name = 'cums-admin-site';
        yield app.save();

        console.log('Application created');
        console.log(`\taccessId: ${app._id.toString()}`);
        console.log(`\taccessSecret: ${app.accessSecret.toString()}`);
        console.log(`\tname: ${app.name}`);

        config.SITE = {
            ACCESS_ID: app._id.toString(),
            ACCESS_SECRET: app.accessSecret,
            NAME: app.name
        };

    }


    let adminPermissions = [];

    for (const permission of permissionList) {
        const adminPermission = new models.Permission();
        adminPermission.name = permission;
        adminPermission.scope = 'application';
        adminPermission.scopeId = app;
        yield adminPermission.save();
        adminPermissions.push(adminPermission);
        console.log(`permission ${permission} created`);
    }

    
    {
        const adminRole = new models.Role();
        adminRole.name = 'site-admin';
        adminRole.scope = 'application';
        adminRole.scopeId = app;
        adminRole.permissions = adminPermissions;
        yield adminRole.save();
        console.log('admin role created');

        console.log(' creating admin user');
        const input = yield prompt.prompt([{
            type: 'input', 
            message: 'Admin username:',
            name: 'account'
        }, {
            type: 'password', 
            message: 'Admin password:',
            name: 'secret'
        }]);
        const account = input.account;
        const secret = input.secret;

        const admin = new models.User();
        admin.credentials = [{
            method: 'username',
            account,
            secret: md5(config.CRYPT.SALT + 
                    '-' + secret + '+' + 
                    config.CRYPT.SALT)
        }];
        admin.roles = [adminRole];
        admin.profiles = [{
            application: app,
            metadata: {

            }
        }];
        yield admin.save();
        app.user = admin;
        yield app.save();
        console.log('admin created');
        console.log(`\tmethod: username`)
        console.log(`\taccount: ${account}`);
    }

    fs.writeFileSync(projectRoot + '/config.js', 
        'module.exports = ' + JSON.stringify(config, 0, 4) + ';\n');

    db.close();
}
