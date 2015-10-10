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

/**
 * Check whether content of `node` should be escaped.
 *
 * @param {Node} node - Node to check.
 * @return {boolean} - Whether content of `node` should be
 *   escaped.
 */
function isLiteral(node) {
    return node && (node.tagName === 'script' || node.tagName === 'style');
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
 * @param {Object?} options - Configuration.
 * @param {HAST} hast - Processor.
 */
function Compiler(file, options, hast) {
    this.data = hast.data;
    this.file = file;
}

/**
 * Compile all children of `parent`.
 *
 * @param {HastNode} parent - Parent whose children to
 *   compile.
 * @return {string} - Compiled children.
 */
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

/**
 * Compile `node`.
 *
 * @param {HastNode} node - Node to compile.
 * @param {HastNode?} [parent] - Parent of `node`, when
 *   applicable.
 * @return {string} - Compiled `node`.
 * @throws {Error} - When `node` cannot be compiled becase
 *   it is unknown.
 */
function one(node, parent) {
    var self = this;
    var type = node.type;

    if (type in self) {
        return self[type](node, parent);
    }

    throw new Error('Missing compiler for node of type `' + type + '`');
}

/**
 * Compile a directive `node`.
 *
 * @param {HastDirective} node - Node to compile.
 * @return {string} - Compiled `node`.
 */
function directive(node) {
    return '<' + node.value + '>';
}

/**
 * Compile a comment `node`.
 *
 * @param {HastComment} node - Node to compile.
 * @return {string} - Compiled `node`.
 */
function comment(node) {
    return '<!--' + node.value + '-->';
}

/**
 * Compile a character-data `node`.
 *
 * @param {HastCharacterData} node - Node to compile.
 * @return {string} - Compiled `node`.
 */
function characterData(node) {
    return '<![CDATA[' + node.value + ']]>';
}

/**
 * Compile a text `node`.
 *
 * @param {HastText} node - Node to compile.
 * @param {HastParent?} [parent] - Parent of `node`.
 * @return {string} - Compiled `node`.
 */
function text(node, parent) {
    return isLiteral(parent) ? node.value : htmlEscape(node.value);
}

/**
 * Compile an element `node`.
 *
 * @param {HastElement} node - Node to compile.
 * @return {string} - Compiled `node`.
 */
function element(node) {
    var self = this;
    var nodeName = node.tagName;
    var value = '<' + nodeName;
    var attributes = compileAttributes(node.properties);

    if (attributes) {
        value += ' ' + attributes;
    }

    value += '>' + self.all(node);

    return value + (self.data.voids[nodeName] ? '' : '</' + nodeName + '>');
}

/**
 * Stringify the bound file.
 *
 * @this {Compiler}
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
visitors.characterData = characterData;
visitors.text = text;
visitors.element = element;

/*
 * Expose.
 */

module.exports = Compiler;
