'use strict';

//const prettyError = require('./prettyError');
const fs = require('fs');

const content = fs.readFileSync('./d').toString();

const pretty = require('ansi_up').ansi_to_html

let output = '';
for (const c of content.split('\n')) {
    output += pretty(c) + '<br/>';
}

fs.writeFileSync('./demo.html', output);
