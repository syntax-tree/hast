/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module hast:h:fragment
 * @fileoverview Virtual fragment.
 */

/* eslint-env commonjs */

/*
 * Dependencies.
 */

var version = require('./version');

/**
 * Fragment.
 *
 * @param {Array} children - List of child nodes.
 * @return {HastFragment} - Fragment node.
 */
function fragment(children) {
    return {
        'type': 'HastFragment',
        'version': version,
        'children': children
    };
}

/*
 * Expose.
 */

module.exports = fragment;
