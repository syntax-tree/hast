/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module hast:h:comment
 * @fileoverview Virtual directive.
 */

/* eslint-env commonjs */

/*
 * Dependencies.
 */

var version = require('./version');

/**
 * Directive.
 *
 * @param {string} name - Directive name.
 * @param {string} value - Text-content.
 * @return {HastDirective} - Directive node.
 */
function directive(name, value) {
    return {
        'type': 'HastDirective',
        'version': version,
        'name': name,
        'text': value || ''
    };
}

/*
 * Expose.
 */

module.exports = directive;
