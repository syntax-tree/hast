/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module hast:attributes:parse
 * @fileoverview Transform a map of attributes to `VProperties`.
 */

/* eslint-env commonjs */

/*
 * Dependencies.
 */

var trim = require('trim');
var camelcase = require('camelcase');
var decode = require('ent').decode;
var propertyInformation = require('property-information');

var EMPTY = '';
var COMMA = ',';
var SPACE = ' ';
var TAB = '\t';
var FORM_FEED = '\f';
var LINE_FEED = '\f';
var CARIAGE_RETURN = '\r';

/**
 * Check whether `character` is a space character.
 *
 * @see https://html.spec.whatwg.org/#space-character
 *
 * @param {string} character - Character to check.
 * @return {boolean} - Whether `character` is a space
 *   character.
 */
function isSpaceCharacter(character) {
    return character === SPACE ||
        character === TAB ||
        character === FORM_FEED ||
        character === LINE_FEED ||
        character === CARIAGE_RETURN
}

/**
 * Parse a space-separated list.
 *
 * @see https://html.spec.whatwg.org/#space-separated-tokens
 *
 * @param {string} value - List to tokenize.
 * @return {Array.<string>} - List of tokens.
 */
function parseSpaceSeparatedList(value) {
    var tokens = [];
    var length = value.length;
    var index = -1;
    var character;
    var token = EMPTY;

    while (++index < length) {
        character = value.charAt(index);

        if (!isSpaceCharacter(character)) {
            token += character;
        } else if (token) {
            tokens.push(token);
            token = EMPTY;
        }
    }

    if (token) {
        tokens.push(token);
    }

    return tokens;
}

/**
 * Parse a comma-separated list.
 *
 * @see https://html.spec.whatwg.org/#comma-separated-tokens
 *
 * @param {string} value - List to tokenize.
 * @return {Array.<string>} - List of tokens.
 */
function parseCommaSeparatedList(value) {
    var tokens = [];
    var length = value.length;
    var index = -1;
    var character;
    var queue = EMPTY;
    var token = EMPTY;

    while (++index < length) {
        character = value.charAt(index);

        if (isSpaceCharacter(character)) {
            queue += character;
        } else if (character === COMMA) {
            tokens.push(token);
            queue = token = EMPTY;
        } else {
            if (token && queue) {
                token += queue;
            }

            token += character;
            queue = EMPTY;
        }
    }

    if (token) {
        tokens.push(token);
    }

    return tokens;
}

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
 * Parse a primitive value.
 *
 * @param {string} name - Attribute name.
 * @param {string} value - Attribute value.
 * @param {Object} info - Information for attribute.
 * @return {boolean|number|string} - Parsed value.
 */
function decoratePrimitive(name, value, info) {
    if (info.boolean) {
        value = true;
    } else if (info.overloadedBoolean) {
        value = value === '' || value.toLowerCase() === info.name ? true : value;
    } else if (info.numeric || info.positiveNumeric) {
        value = Number(value);
    }

    return value;
}

/**
 * Parse a value.
 *
 * @param {string} name - Attribute name.
 * @param {string} value - Attribute value.
 * @param {Object} info - Information for attribute.
 * @return {*} - Parsed value.
 */
function decorate(name, value, info) {
    var converter = propertyValueConversions[name];
    var index = -1;
    var length;

    if (typeof converter === 'function') {
        value = converter(value);
    } else if (info.spaceSeparated) {
        value = parseSpaceSeparatedList(value);
    } else if (info.commaSeparated) {
        value = parseCommaSeparatedList(value);
    }

    length = typeof value === 'object' && value.length;

    if (!length) {
        return decoratePrimitive(name, value, info);
    }

    while (++index < length) {
        value[index] = decoratePrimitive(name, value[index], info);
    }

    return value;
}

/**
 * Parse a map of HTML attributes into `VProperties`.
 *
 * @param {Object.<string, string>} attributes - Map of
 *   attributes found on an HTML node.
 * @return {VProperties} - Map of virtual-dom properties.
 */
function parse(attributes) {
    var vproperties = {};
    var propertyName;
    var value;
    var name;
    var info;

    for (name in attributes) {
        value = attributes[name];
        info = propertyInformation(name) || {};
        propertyName = info.propertyName || camelcase(name);

        vproperties[propertyName] = decorate(propertyName, value, info);
    }

    return vproperties;
}

/*
 * Expose.
 */

module.exports = parse;
