/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module hast:attributes:parse
 * @fileoverview Transform a map of attributes to `VProperties`.
 * @see https://github.com/facebook/react/blob/f445dd91b0088588a2c25d38a3755c09d78dddcf/src/renderers/dom/shared/HTMLDOMPropertyConfig.js
 */

/* eslint-env commonjs */

/*
 * Dependencies.
 */

var trim = require('trim');
var decode = require('ent').decode;
var propertyInformation = require('./property-information');

/**
 * Check whether `value` is a custom attribute.
 *
 * @param {string} value - Value to test.
 * @return {boolean} - Whether `value` is a custom attribute.
 */
var isCustomAttribute = RegExp.prototype.test.bind(
    /^(data|aria)-[a-z_][a-z\d_.\-]*$/
);

/**
 * Parse `value` into a virtual style object.
 *
 * @param {string} value - Stringified CSS rules.
 * @return {Object.<string, string>} - Map of CSS
 *   properties mapping to CSS values.
 */
function parseStyle(value) {
    var declarations = value.split(';');
    var length = declarations.length;
    var rules = {};
    var index = -1;
    var entry;
    var property;

    while (++index < length) {
        entry = declarations[index].split(/:(.+)/);
        property = trim(entry[0]);
        value = trim(entry[1] || '');

        if (property && value) {
            rules[property] = value;
        }
    }

    return rules;
}

/*
 * Map of transformers for certain properties.
 */

var propertyValueConversions = {
    'style': parseStyle,
    'placeholder': decode,
    'title': decode,
    'alt': decode
};

/**
 * Parse a map of HTML attributes into `VProperties`.
 *
 * @param {Object.<string, string>} attributes - Map of
 *   attributes found on an HTML node.
 * @return {VProperties} - Map of virtual-dom properties.
 */
function parse(attributes) {
    var vproperties = {};
    var vattributes = {};
    var name;
    var info;
    var value;
    var converter;
    var propertyName;
    var context;
    var key;

    for (name in attributes) {
        value = attributes[name];
        info = propertyInformation(name);

        if (!info || isCustomAttribute(name)) {
            vattributes[name] = value;

            continue;
        }

        propertyName = key = info.propertyName;
        converter = propertyValueConversions[propertyName];
        context = vproperties;

        if (converter) {
            value = converter(value);
        }

        if (info.useAttribute) {
            context = vattributes;
            key = info.name;
            /* html2vdom uses `''` here, but that’s a
             * falsey value. */
            value = info.boolean ? true : value;
        } else if (info.boolean) {
            value = value === '' || value.toLowerCase() === info.name;
        } else if (info.overloadedBoolean) {
            value = value === '';
        } else if (info.numeric || info.positiveNumeric) {
            value = Number(value);
        }

        context[key] = value;
    }

    vproperties.attributes = vattributes;

    return vproperties;
}

/*
 * Expose.
 */

module.exports = parse;
