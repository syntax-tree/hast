/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module hast:attributes:property-information
 * @fileoverview Transform a map of attributes to `VProperties`.
 * @see https://github.com/facebook/react/blob/f445dd91b0088588a2c25d38a3755c09d78dddcf/src/renderers/dom/shared/HTMLDOMPropertyConfig.js
 */

/* eslint-env commonjs */

/*
 * Constants.
 */

var USE_ATTRIBUTE = 0x1;
var USE_PROPERTY = 0x2;
var BOOLEAN_VALUE = 0x8;
var NUMERIC_VALUE = 0x10;
var POSITIVE_NUMERIC_VALUE = 0x20 | 0x10;
var OVERLOADED_BOOLEAN_VALUE = 0x40;

/**
 * Check a mask.
 *
 * @param {string} value - Config.
 * @param {number} bitmask - Mask.
 * @return {boolean} - Whether `mask` matches `config`.
 */
function check(value, bitmask) {
  return (value & bitmask) === bitmask;
}

/**
 * Lower-case a string.
 *
 * @param {string} value - Content.
 * @return {string} - Lower-cased `value`.
 */
function lower(value) {
  return value.toLowerCase();
}

var propertyConfig = {
    /*
     * Standard Properties
     */
    'accept': null,
    'acceptCharset': null,
    'accessKey': null,
    'action': null,
    'allowFullScreen': USE_ATTRIBUTE | BOOLEAN_VALUE,
    'allowTransparency': USE_ATTRIBUTE,
    'alt': null,
    'async': BOOLEAN_VALUE,
    'autoComplete': null,
    'autoFocus': BOOLEAN_VALUE,
    'autoPlay': BOOLEAN_VALUE,
    'capture': USE_ATTRIBUTE | BOOLEAN_VALUE,
    'cellPadding': null,
    'cellSpacing': null,
    'charSet': USE_ATTRIBUTE,
    'challenge': USE_ATTRIBUTE,
    'checked': USE_PROPERTY | BOOLEAN_VALUE,
    'classID': USE_ATTRIBUTE,
    /* To set className on SVG elements, it's necessary to
     * use .setAttribute; this works on HTML elements too
     * in all browsers except IE8. */
    'className': USE_ATTRIBUTE,
    'cols': USE_ATTRIBUTE | POSITIVE_NUMERIC_VALUE,
    'colSpan': null,
    'content': null,
    'contentEditable': null,
    'contextMenu': USE_ATTRIBUTE,
    'controls': USE_PROPERTY | BOOLEAN_VALUE,
    'coords': null,
    'crossOrigin': null,
    /* For `<object />` acts as `src`. */
    'data': null,
    'dateTime': USE_ATTRIBUTE,
    'defer': BOOLEAN_VALUE,
    'dir': null,
    'disabled': USE_ATTRIBUTE | BOOLEAN_VALUE,
    'download': OVERLOADED_BOOLEAN_VALUE,
    'draggable': null,
    'encType': null,
    'form': USE_ATTRIBUTE,
    'formAction': USE_ATTRIBUTE,
    'formEncType': USE_ATTRIBUTE,
    'formMethod': USE_ATTRIBUTE,
    'formNoValidate': BOOLEAN_VALUE,
    'formTarget': USE_ATTRIBUTE,
    'frameBorder': USE_ATTRIBUTE,
    'headers': null,
    'height': USE_ATTRIBUTE,
    'hidden': USE_ATTRIBUTE | BOOLEAN_VALUE,
    'high': null,
    'href': null,
    'hrefLang': null,
    'htmlFor': null,
    'httpEquiv': null,
    'icon': null,
    'id': USE_PROPERTY,
    'inputMode': USE_ATTRIBUTE,
    'is': USE_ATTRIBUTE,
    'keyParams': USE_ATTRIBUTE,
    'keyType': USE_ATTRIBUTE,
    'label': null,
    'lang': null,
    'list': USE_ATTRIBUTE,
    'loop': USE_PROPERTY | BOOLEAN_VALUE,
    'low': null,
    'manifest': USE_ATTRIBUTE,
    'marginHeight': null,
    'marginWidth': null,
    'max': null,
    'maxLength': USE_ATTRIBUTE,
    'media': USE_ATTRIBUTE,
    'mediaGroup': null,
    'method': null,
    'min': null,
    'minLength': USE_ATTRIBUTE,
    'multiple': USE_PROPERTY | BOOLEAN_VALUE,
    'muted': USE_PROPERTY | BOOLEAN_VALUE,
    'name': null,
    'noValidate': BOOLEAN_VALUE,
    'open': BOOLEAN_VALUE,
    'optimum': null,
    'pattern': null,
    'placeholder': null,
    'poster': null,
    'preload': null,
    'radioGroup': null,
    'readOnly': USE_PROPERTY | BOOLEAN_VALUE,
    'rel': null,
    'required': BOOLEAN_VALUE,
    'role': USE_ATTRIBUTE,
    'rows': USE_ATTRIBUTE | POSITIVE_NUMERIC_VALUE,
    'rowSpan': null,
    'sandbox': null,
    'scope': null,
    'scoped': BOOLEAN_VALUE,
    'scrolling': null,
    'seamless': USE_ATTRIBUTE | BOOLEAN_VALUE,
    'selected': USE_PROPERTY | BOOLEAN_VALUE,
    'shape': null,
    'size': USE_ATTRIBUTE | POSITIVE_NUMERIC_VALUE,
    'sizes': USE_ATTRIBUTE,
    'span': POSITIVE_NUMERIC_VALUE,
    'spellCheck': null,
    'src': null,
    'srcDoc': USE_PROPERTY,
    'srcSet': USE_ATTRIBUTE,
    'start': NUMERIC_VALUE,
    'step': null,
    'style': null,
    'summary': null,
    'tabIndex': null,
    'target': null,
    'title': null,
    'type': null,
    'useMap': null,
    'value': USE_PROPERTY,
    'width': USE_ATTRIBUTE,
    'wmode': USE_ATTRIBUTE,
    'wrap': null,

    /*
     * Non-standard Properties
     */

    /* autoCapitalize and autoCorrect are supported in
     * Mobile Safari forkeyboard hints. */
    'autoCapitalize': null,
    'autoCorrect': null,
    /* autoSave allows WebKit/Blink to persist values of
     * input fields on page reloads */
    'autoSave': null,
    /* itemProp, itemScope, itemType are for Microdata
     * support. See http://schema.org/docs/gs.html */
    'itemProp': USE_ATTRIBUTE,
    'itemScope': USE_ATTRIBUTE | BOOLEAN_VALUE,
    'itemType': USE_ATTRIBUTE,
    /* itemID and itemRef are for Microdata support as well
     * but only specified in the the WHATWG spec document.
     * See https://html.spec.whatwg.org/multipage/
     * microdata.html#microdata-dom-api
     */
    'itemID': USE_ATTRIBUTE,
    'itemRef': USE_ATTRIBUTE,
    /* property is supported for OpenGraph in meta tags. */
    'property': null,
    /* results show looking glass icon and recent searches
     * on input search fields in WebKit/Blink */
    'results': null,
    /* IE-only attribute that specifies security
     * restrictions on an iframe as an alternative to the
     * sandbox attribute on IE < 10 */
    'security': USE_ATTRIBUTE,
    /* IE-only attribute that controls focus behavior */
    'unselectable': USE_ATTRIBUTE
};

/*
 * Map of properties to attributes.
 */

var propertyToAttributeMapping = {
    'className': 'class',
    'htmlFor': 'for',
    'httpEquiv': 'http-equiv',
    'acceptCharset': 'accept-charset'
};

/*
 * Expand config.
 */

var propInfoByAttributeName = {};
var property;
var name;
var config;

for (property in propertyConfig) {
    name = propertyToAttributeMapping[property] || lower(property);
    config = propertyConfig[property];

    propInfoByAttributeName[name] = {
        'name': name,
        'propertyName': property,
        'useAttribute': check(config, USE_ATTRIBUTE),
        'mustUseProperty': check(config, USE_PROPERTY),
        'boolean': check(config, BOOLEAN_VALUE),
        'overloadedBoolean': check(config, OVERLOADED_BOOLEAN_VALUE),
        'numeric': check(config, NUMERIC_VALUE),
        'positiveNumeric': check(config, POSITIVE_NUMERIC_VALUE)
    };
}

/**
 * Get a config for a property.
 *
 * @param {string} name - Property name.
 * @return {Object?} - Property config.
 */
function getPropertyInfo(name) {
    return propInfoByAttributeName[lower(name)];
}

/*
 * Expose.
 */

module.exports = getPropertyInfo;
