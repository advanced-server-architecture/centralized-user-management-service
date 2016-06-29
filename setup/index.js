'use strict';
const path = require('path')
require('app-module-path').addPath(path.resolve(__dirname, '../'))
const co = require('co');
const prompt = require('inquirer');
co(function* () {
    yield require('setup/db')();
    const input = yield prompt.prompt([{
        name: 'test',
        message: 'create test data?',
        default: false,
        type: 'confirm'
    }]);
    if (input.test) {
        yield require('setup/test')();
    }
    console.log('all done');
    process.exit(0);
})
.catch(e => {
    console.log(e.stack);
})