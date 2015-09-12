/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module hast:h:text
 * @fileoverview Virtual text.
 */

/* eslint-env commonjs */

/*
 * Dependencies.
 */

var version = require('virtual-dom/vnode/version');

/**
 * Text.
 *
 * @param {string} value - Text-content.
 * @return {VirtualText} - Text node.
 */
function text(value) {
    return {
        'type': 'VirtualText',
        'version': version,
        'text': value || ''
    };
}

/*
 * Expose.
 */

module.exports = text;
