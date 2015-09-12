/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module hast:vcomment
 * @fileoverview Virtual Comment.
 */

/* eslint-env commonjs */

/*
 * Dependencies.
 */

var version = require('./version');

/**
 * Comment.
 */
function isHastComment(node) {
    return node && node.type === 'HastComment' && node.version === version;
}

/*
 * Expose.
 */

module.exports = isHastComment;
