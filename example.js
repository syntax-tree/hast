/* eslint-env node */
/* eslint-disable no-console */
var util = require('util');
var fs = require('fs');
var hast = require('.');
var visit = require('./util/visit');

var doc = fs.readFileSync('example.html', 'utf8');

function strong() {
    return function (tree) {
        visit(tree, 'B', function (node) {
            node.tagName = 'STRONG';
        });
    };
}

function log() {
    return function (tree) {
        console.log(util.inspect(tree, {
            'depth': null,
            'colors': true
        }));
    };
}

hast().use(strong).use(log).process(doc, function (err, file, doc) {
    if (err) {
        console.log(String(err.stack));
    }
    console.log('-- doc -------------------------------');
    console.log(doc);
});
