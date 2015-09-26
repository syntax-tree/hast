/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module hast:attributes:compile
 * @fileoverview Transform a map `VProperties` to attributes.
 */

/* eslint-env commonjs */

/*
 * Dependencies.
 */

var escapeHTML = require('escape-html');
var paramCase = require('param-case');
var propertyInformation = require('property-information');

/**
 * Compile a normal attribute.
 *
 * @param {string} name - Attribute name.
 * @param {string} value - Attribute value.
 * @return {string} - Attribute.
 */
function stringify(name, value) {
    return escapeHTML(name) +
        (arguments.length === 1 ? '' : ('="' + escapeHTML(value) + '"'));
}

/**
 * Create attribute string.
 *
 * @param {string} name - Attribute name.
 * @param {*} value - Attribute value.
 * @param {boolean} [isAttribute] - Whether `name` is
 *   an attribute.
 * @return {string} - Stringified attribute.
 */
function attribute(name, value) {
    var info = propertyInformation(name) || {};

    if (
        (value === null || value === undefined) ||
        (!value && info.boolean) ||
        (value === false && info.overloadedBoolean)
    ) {
        return '';
    }

    name = info.name || paramCase(name);

    if (
        info.boolean ||
        (value === true && info.overloadedBoolean)
    ) {
        return stringify(name);
    }

    if (typeof value === 'object' && 'length' in value) {
        value = value.join(info.commaSeparated ? ',' : ' ');
    }

    return stringify(name, value);
}

/**
 * Stringify `VProperties` into HTML attributes.
 *
 * @param {VProperties} vproperties - Map of virtual
 *   properties.
 * @return {string} - Stringified properties.
 */
function compile(vproperties) {
    var attributes = [];
    var key;
    var value;
    var property;
    var declarations;
    var result;

    for (key in vproperties) {
        value = vproperties[key];

        if (value === null || value === undefined) {
            continue;
        }

        if (key === 'style') {
            declarations = [];

            for (property in value) {
                declarations.push(
                    paramCase(property) + ': ' + value[property] + ';'
                );
            }

            value = declarations.join(' ');
        }

        result = attribute(key, value);

        if (result) {
            attributes.push(result);
        }
    }

    return attributes.join(' ');
}

/*
 * Expose.
 */

module.exports = compile;
