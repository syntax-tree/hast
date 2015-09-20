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

/*
 * Expose.
 */

module.exports = unified({
    'name': 'hast',
    'type': 'tree',
    'Parser': Parser,
    'Compiler': Compiler
});
