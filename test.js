/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module hast
 * @fileoverview Test suite for `hast`.
 */

'use strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var test = require('tape');
var visit = require('unist-util-visit');
var hast = require('./');

/*
 * Tests.
 */

test('hast()', function (t) {
    t.plan(2);

    hast.use(function () {
        return function (tree) {
            visit(tree, 'element', function (node) {
                if (node.tagName === 'b') {
                    node.tagName = 'strong';
                }
            });
        }
    }).process('<b>Hello</b>', function (err, file, doc) {
        t.error(err);
        t.equal(doc, '<strong>Hello</strong>');
    });
});
