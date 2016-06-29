'use strict';
const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
const config = require('config');


mongoose.connect(config.MONGODB);
let models = {};
const files = fs.readdirSync('./model');
for (const file of files) {
    const name = path.basename(file).slice(0, -3);
    models[name] = mongoose.model(name, require('model/' + file));
}

module.exports = models;