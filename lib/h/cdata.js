/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module hast:h:cdata
 * @fileoverview Virtual CDATA.
 */

/* eslint-env commonjs */

/*
 * Dependencies.
 */

var version = require('./version');

/**
 * CDATA.
 *
 * @param {string} value - Text-content.
 * @return {HastCDATA} - CDATA node.
 */
function cdata(value) {
    return {
        'type': 'HastCData',
        'version': version,
        'text': value || ''
    };
}

/*
 * Expose.
 */

module.exports = cdata;
