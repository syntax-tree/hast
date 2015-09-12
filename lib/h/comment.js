/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module hast:h:comment
 * @fileoverview Virtual comment.
 */

/* eslint-env commonjs */

/*
 * Dependencies.
 */

var version = require('./version');

/**
 * Comment.
 *
 * @param {string} value - Text-content.
 * @return {HastComment} - Comment node.
 */
function comment(value) {
    return {
        'type': 'HastComment',
        'version': version,
        'text': value
    };
}

/*
 * Expose.
 */

module.exports = comment;
