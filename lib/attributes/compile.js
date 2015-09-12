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
var softHook = require('virtual-dom/virtual-hyperscript/hooks/soft-set-hook');
var attrHook = require('virtual-dom/virtual-hyperscript/hooks/attribute-hook');
var propertyInformation = require('./property-information');

/**
 * Compile a normal attribute.
 *
 * @param {string} name - Attribute name.
 * @param {string} value - Attribute value.
 * @return {string} - Attribute.
 */
function stringify(name, value) {
    return escapeHTML(name) + '="' + escapeHTML(value) + '"';
}

/**
 * Create attribute string.
 *
 * @param {String} name - Attribute name.
 * @param {*} value - Attribute value.
 * @param {boolean} [isAttribute] - Whether `name` is
 *   an attribute.
 * @return {string} - Stringified attribute.
 */
function attribute(name, value, isAttribute) {
    var info = propertyInformation(name);

    if (info) {
        if (
            (value === null || value === undefined) ||
            (!value && info.boolean) ||
            (value === false && info.overloadedBoolean)
        ) {
            return '';
        }

        name = info.name;

        if (
            info.boolean ||
            (value === true && info.overloadedBoolean)
        ) {
            return escapeHTML(name);
        }

        return stringify(name, value);
    }

    if (isAttribute && (value !== null || value !== undefined)) {
        return stringify(name, value);
    }

    /*
     * `name` is neither a valid property nor an attribute.
     */

    return '';
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
    var attributeKey;
    var property;
    var declarations;
    var result;

    for (key in vproperties) {
        value = vproperties[key];

        if (value === null || value === undefined) {
            continue;
        }

        if (key === 'attributes') {
            for (attributeKey in value) {
                attributes.push(
                    attribute(attributeKey, value[attributeKey], true)
                );
            }

            continue;
        }

        if (value instanceof softHook || value instanceof attrHook) {
            attributes.push(attribute(key, value.value, true));

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
