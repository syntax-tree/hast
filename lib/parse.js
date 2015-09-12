/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module hast:parse
 * @fileoverview Parse HTML into VDOM.
 */

/* eslint-env commonjs */

/*
 * Dependencies.
 */

var bail = require('bail');
var Tokenizer = require('htmlparser2/lib/Tokenizer.js');
var isVirtualText = require('virtual-dom/vnode/is-vtext');
var hnode = require('./h/node');
var htext = require('./h/text');
var hcomment = require('./h/comment');
var hcdata = require('./h/cdata');
var hdirective = require('./h/directive');
var hfragment = require('./h/fragment');
var isHastComment = require('./h/is-comment');
var openClose = require('./data/open-close');
var voids = require('./data/void');

/*
 * Methods.
 */

var has = Object.prototype.hasOwnProperty;

/*
 * Constants.
 */

var NAME_END = /\s|\//;

/**
 * Get the first entry.
 *
 * @param {Array} values - List.
 * @return {*} - Entry.
 */
function first(values) {
    return values[0];
}

/**
 * Get the last entry.
 *
 * @param {Array} values - List.
 * @return {*} - Entry.
 */
function last(values) {
    return values[values.length - 1];
}

/**
 * Utility to patch positions of type `type`.
 *
 * @param {string} type - Position type.
 * @return {Function} - Patcher for `type`.
 */
function patchFactory(type) {
    /**
     * Patch `type` positions of `node` based on the given
     * `parser`.
     *
     * @param {HThing} node - Node to patch.
     * @param {Object} relative - Source position.
     */
    return function (node, relative) {
        var context = relative[type];
        var pos = node.position || (node.position = {});

        pos = pos[type] || (pos[type] = {});

        pos.line = context.line;
        pos.column = context.column;
        pos.offset = context.offset;

        /* For some reason the final `>` is never counted. */
        if (type === 'end' && !isVirtualText(node)) {
            pos.column++;
        }
    }
}

var start = patchFactory('start');
var end = patchFactory('end');

/**
 * Utility to get the name of an instruction.
 *
 * @param {string} value - Instruction text.
 * @return {string} - Name of instruction.
 */
function getInstructionName(value) {
    var index = value.search(NAME_END);

    return (index < 0 ? value : value.substr(0, index)).toLowerCase();
}

/**
 * Construct a new parser.
 *
 * @example
 *   var file = new VFile('<span>Hello</span>.');
 *   var parser = new Parser(file);
 *
 * @constructor
 * @class {Parser}
 * @param {File} file - Virtual file.
 */
function Parser(file) {
    this.file = file;
    this.stack = [];
    this.dom = [];
    this.tagNameStack = [];

    this.tagName = '';
    this.attributeName = '';
    this.attributeValue = '';
    this.attributes = null;

    this.start = {};
    this.end = {};
    this.start.line = this.end.line = this.start.column = this.end.column = 1;
    this.start.offset = 0;
    this.end.offset = null;
    this.tokenizer = new Tokenizer({
        'decodeEntities': true
    }, this);
}

/**
 * Parse the bound virtual file.
 *
 * @this {Parser}
 * @return {HFragment} - Hast fragment.
 */
function parse() {
    this.tokenizer.end(this.file.toString());

    return hfragment(this.dom);
}

/**
 * Update the position.
 *
 * @param {number} initial - Initial offset.
 * @this {Parser}
 */
function update(initial) {
    var self = this;
    var tokenizer = self.tokenizer;
    var endOffset = tokenizer.getAbsoluteIndex();
    var offset;
    var buffer;
    var index;
    var length;
    var type;

    if (self.end.offset !== null) {
        offset = self.end.offset + 1;
    } else if (tokenizer._sectionStart <= initial) {
        offset = 0;
    } else {
        offset = tokenizer._sectionStart - initial;
    }

    buffer = tokenizer._buffer;
    index = self.start.offset - 1;
    length = endOffset;

    while (++index < length) {
        type = index < offset ? 'start' : 'end';

        if (index === offset) {
            self.end.line = self.start.line;
            self.end.column = self.start.column;
        }

        if (buffer.charAt(index) === '\n') {
            self[type].line++;
            self[type].column = 0;
        }

        self[type].column++;
    }

    self.start.offset = offset;
    self.end.offset = endOffset;
}

/**
 * Exit a node.
 *
 * @param {HThing}
 * @this {Parser}
 */
function enter(node) {
    var self = this;
    var parent = last(self.stack);
    var head = node.children && first(node.children);

    (parent ? parent.children : self.dom).push(node);

    start(node, this);

    if (head) {
        start(head, this);
    }

    return node;
}

/**
 * Exit the current node.
 *
 * @this {Parser}
 */
function exit() {
    end(this.stack.pop(), this);
}

/**
 * Handle raw-text.
 *
 * @param {string} value - Content.
 * @this {Parser}
 */
function raw(value) {
    var self = this;
    var parent = last(self.stack);
    var domTail = !parent && last(self.dom);
    var prevTail = parent && last(parent.children);
    var node;

    if (domTail && isVirtualText(domTail)) {
        node = domTail;
    } else if (prevTail && isVirtualText(prevTail)) {
        node = prevTail;
    } else {
        node = this.enter(htext(''));
    }

    end(node, self);

    node.text += value;
}

/**
 * Add a node for `tag`.
 *
 * @param {string} tagName - Tag-name.
 * @param {Object} attributes - Attribute names mapping to
 *   attribute values.
 * @this {Parser}
 */
function tag(tagName, attributes) {
    this.stack.push(this.enter(hnode(tagName, attributes, [])));
}

/**
 * Close the current node.
 *
 * @this {Parser}
 */
function close() {
    var self = this;
    var name = self.tagName;

    self.onopentagend();

    if (last(self.tagNameStack) === name) {
        self.exit();
        self.tagNameStack.pop();
    }
}

/**
 * Handle an instruction (declaration and processing
 * instruction).
 *
 * @param {string} name - instruction name.
 * @param {string} value - Content.
 * @this {Parser}
 */
function instruction(name, value) {
    var node = this.enter(hdirective(name, value));

    this.update(0);

    end(node, this);
}

/**
 * Handle text.
 *
 * @param {string} tagName - Tag-name.
 * @this {Parser}
 */
function text(value) {
    this.update(1);
    this.end.offset--;

    this.raw(value);
}

/**
 * Handle the start of an opening tag.
 *
 * @param {string} tagName - Tag-name.
 * @this {Parser}
 */
function openTagStart(tagName) {
    var name = tagName.toUpperCase();

    this.tagName = name;

    if (has.call(openClose, name)) {
        while (has.call(openClose, last(this.tagNameStack))) {
            this.onclosetag(last(this.tagNameStack));
        }
    }

    if (!has.call(voids, name)) {
        this.tagNameStack.push(name);
    }

    this.attributes = {};
}

/**
 * Handle the end of an opening tag.
 *
 * @this {Parser}
 */
function openTagEnd() {
    var self = this;

    self.update(1);

    if (self.attributes) {
        self.tag(self.tagName, self.attributes);
        self.attributes = null;
    }

    if (has.call(voids, self.tagName)) {
        self.exit();
    }

    self.tagName = '';
}

/**
 * Handle an closing tag.
 *
 * @param {string} tagName - Tag-name.
 * @this {Parser}
 */
function closeTag(tagName) {
    var self = this;
    var name = tagName.toUpperCase();
    var pos;

    self.update(1);

    if (self.tagNameStack.length && !has.call(voids, name)) {
        pos = self.tagNameStack.lastIndexOf(name);

        if (pos !== -1) {
            pos = self.tagNameStack.length - pos;

            while (pos--) {
                self.tagNameStack.pop();
                self.exit();
            }
        } else if (name === 'P') {
            self.onopentagname(name);
            self.close();
        }
    } else if (name === 'br' || name === 'P') {
        self.onopentagname(name);
        self.close();
    }
}

/**
 * Handle an attribute name.
 *
 * @param {string} value - Content.
 * @this {Parser}
 */
function attributeName(value) {
    this.attributeName = value;
}

/**
 * Handle a continued attribute value.
 *
 * @param {string} value - Content.
 * @this {Parser}
 */
function attributeContinue(value) {
    this.attributeValue += value;
}

/**
 * Handle the end of an attribute.
 *
 * @this {Parser}
 */
function attributeEnd() {
    var self = this;
    var attributes = self.attributes;
    var name = self.attributeName;

    if (attributes && !has.call(attributes, name)) {
        attributes[name] = self.attributeValue;
    }

    self.attributeName = '';
    self.attributeValue = '';
}

/**
 * Handle a declaration.
 *
 * @param {string} value - Content.
 * @this {Parser}
 */
function declaration(value) {
    this.instruction('!' + getInstructionName(value), '!' + value);
}

/**
 * Handle a processing instruction.
 *
 * @param {string} value - Content.
 * @this {Parser}
 */
function processingInstruction(value) {
    this.instruction('?' + getInstructionName(value), '?' + value);
}

/**
 * Handle a comment token.
 *
 * @param {string} value - Content.
 * @this {Parser}
 */
function comment(value) {
    var self = this;
    var tail = last(self.stack);

    self.update(4);

    if (isHastComment(tail)) {
        tail.text += value;
    } else {
        self.stack.push(self.enter(hcomment(value)));
    }

    self.exit();
}

/**
 * Handle a CDATA token.
 *
 * @param {string} value - Content.
 * @this {Parser}
 */
function cdata(value) {
    var self = this;
    var node;

    self.update(1);

    node = self.enter(hcdata(value));

    self.stack.push(node);

    self.exit();
}

/**
 * flush all currenly open nodes.
 *
 * @this {Parser}
 */
function flush() {
    var length = this.tagNameStack.length;

    while (length--) {
        this.exit();
    }
}

/*
 * Expose core.
 */

Parser.prototype.parse = parse;
Parser.prototype.update = update;

/*
 * Expose utilities.
 */

Parser.prototype.enter = enter;
Parser.prototype.exit = exit;
Parser.prototype.raw = raw;
Parser.prototype.tag = tag;
Parser.prototype.close = close;
Parser.prototype.instruction = instruction;

/*
 * Expose methods `tokenizer` expects.
 */

Parser.prototype.ontext = text;
Parser.prototype.onopentagname = openTagStart;
Parser.prototype.onopentagend = openTagEnd;
Parser.prototype.onclosetag = closeTag;
Parser.prototype.onselfclosingtag = openTagEnd;
Parser.prototype.onattribname = attributeName;
Parser.prototype.onattribdata = attributeContinue;
Parser.prototype.onattribend = attributeEnd;
Parser.prototype.ondeclaration = declaration;
Parser.prototype.onprocessinginstruction = processingInstruction;
Parser.prototype.oncomment = comment;
Parser.prototype.oncdata = cdata;
Parser.prototype.onerror = bail;
Parser.prototype.onend = flush;

/*
 * Expose.
 */

module.exports = Parser;
