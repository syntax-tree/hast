/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module hast:h:node
 * @fileoverview Virtual node.
 */

/* eslint-env commonjs */

/*
 * Dependencies.
 */

var version = require('virtual-dom/vnode/version');
var parse = require('../attributes/parse');

/**
 * Node.
 *
 * @param {string} name - Tag-name.
 * @param {Object} attributes - HTML attributes.
 * @param {Array} children - List of child nodes.
 * @return {VirtualNode} - Element node.
 */
function node(name, attributes, children) {
    return {
        'type': 'VirtualNode',
        'version': version,
        'namespace': null,
        'tagName': String(name).toUpperCase(),
        'properties': parse(attributes),
        'children': children
    };
}

/*
 * Expose.
 */

module.exports = node;
