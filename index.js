/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module hast
 * @fileoverview HTML processor powered by plugins.
 */

/* eslint-env node */

'use strict';

/*
 * Dependencies.
 */

var unified = require('unified');
var Parser = require('./lib/parse');
var Compiler = require('./lib/compile');
var openClose = require('./lib/data/open-close');
var voids = require('./lib/data/void');

/*
 * Expose.
 */

module.exports = unified({
    'name': 'hast',
    'Parser': Parser,
    'Compiler': Compiler,
    'data': {
        'voids': voids,
        'openClose': openClose
    }
});
