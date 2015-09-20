/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module hast:compile
 * @fileoverview Compile HAST into HTML.
 */

/* eslint-env node */

'use strict';

/*
 * Dependencies.
 */

var htmlEscape = require('escape-html');
var compileAttributes = require('./attributes/compile');
var voids = require('./data/void');

/**
 * Check whether content of `node` should be escaped.
 *
 * @param {Node} node - Node to check.
 * @return {boolean} - Whether content of `node` should be
 *   escaped.
 */
function isLiteral(node) {
    return node && (node.tagName === 'SCRIPT' || node.tagName === 'STYLE');
}

/**
 * Construct a new compiler.
 *
 * @example
 *   var file = new VFile('<span>Hello</span>.');
 *   file.namespace('hast').tree = {...};
 *   var compiler = new Compiler(file);
 *
 * @constructor
 * @class {Compiler}
 * @param {File} file - Virtual file.
 */
function Compiler(file) {
    this.file = file;
}

function all(parent) {
    var children = parent && parent.children;
    var length = children && children.length;
    var index = -1;
    var results = [];
    var result;

    while (++index < length) {
        result = this.one(children[index], parent);

        if (result) {
            results.push(result);
        }
    }

    return results.join('');
}

function one(node, parent) {
    var self = this;
    var type = node.type;

    if (type in self) {
        return self[type](node, parent);
    }

    throw new Error('Missing compiler for node of type `' + type + '`');
}

function directive(node) {
    return '<' + node.value + '>';
}

function comment(node) {
    return '<!--' + node.value + '-->';
}

function cdata(node) {
    return '<![CDATA[' + node.value + ']]>';
}

function text(node, parent) {
    return isLiteral(parent) ? node.value : htmlEscape(node.value);
}

function element(node) {
    var nodeName = node.tagName.toLowerCase();
    var value = '<' + nodeName;
    var attributes = compileAttributes(node.properties);

    if (attributes) {
        value += ' ' + attributes;
    }

    value += '>' + this.all(node);

    return value + (voids[node.tagName] ? '' : '</' + nodeName + '>');
}

/**
 * Stringify the bound file.
 *
 * @this {Parser}
 * @return {string} - HTML.
 */
function compile() {
    return this.all(this.file.namespace('hast').tree);
}

var visitors = Compiler.prototype;

/*
 * Expose `compile`.
 */

visitors.compile = compile;
visitors.all = all;
visitors.one = one;
visitors.directive = directive;
visitors.comment = comment;
visitors.cdata = cdata;
visitors.text = text;
visitors.element = element;

/*
 * Expose.
 */

module.exports = Compiler;
