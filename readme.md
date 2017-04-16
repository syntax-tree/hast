# ![HAST][logo]

**H**ypertext **A**bstract **S**yntax **T**ree format.

* * *

**HAST** discloses HTML as an abstract syntax tree.  _Abstract_
means not all information is stored in this tree and an exact replica
of the original document cannot be re-created.  _Syntax Tree_ means syntax
**is** present in the tree, thus an exact syntactic document can be
re-created.

The reason for introducing a new “virtual” DOM is primarily:

*   The DOM is very heavy to implement outside of the browser;
    a lean, stripped down virtual DOM can be used everywhere;
*   Most virtual DOMs do not focus on ease of use in transformations;
*   Other virtual DOMs cannot represent the syntax of HTML in its
    entirety, think comments, document types, and character data;
*   Neither HTML nor virtual DOMs focus on positional information.

**HAST** is a subset of [Unist][], and implemented by [rehype][].

This document describes version 2.0.0 of **HAST**.  [Changelog »][changelog].

## Table of Contents

*   [List of Utilities](#list-of-utilities)
*   [Related HTML Utilities](#related-html-utilities)
*   [AST](#ast)
    *   [Root](#root)
    *   [Element](#element)
    *   [Doctype](#doctype)
    *   [Comment](#comment)
    *   [Text](#text)
*   [Related](#related)

## List of Utilities

<!--
Utilities.  The first two are special.  The rest is sorted
alphabetically based on content after `hast-util-`
-->

*   [`hastscript`](https://github.com/syntax-tree/hastscript)
    — Hyperscript compatible DSL for creating nodes;
*   [`hast-to-hyperscript`](https://github.com/syntax-tree/hast-to-hyperscript)
    — Convert a Node to React, Virtual DOM, Hyperscript, and more;
*   [`hast-util-assert`](https://github.com/syntax-tree/hast-util-assert)
    — Assert HAST nodes;
*   [`hast-util-embedded`](https://github.com/syntax-tree/hast-util-embedded)
    — Check if `node` is embedded content;
*   [`hast-util-find-and-replace`](https://github.com/syntax-tree/hast-util-find-and-replace)
    — Find and replace text;
*   [`hast-util-from-parse5`](https://github.com/syntax-tree/hast-util-to-parse5)
    — Transform Parse5’s AST to HAST;
*   [`hast-util-from-string`](https://github.com/wooorm/rehype-minify/tree/master/packages/hast-util-from-string)
    — Set the plain-text value of a node;
*   [`hast-util-has-property`](https://github.com/syntax-tree/hast-util-has-property)
    — Check if a node has a property;
*   [`hast-util-heading`](https://github.com/syntax-tree/hast-util-heading)
    — Check if a node is heading content;
*   [`hast-util-interactive`](https://github.com/syntax-tree/hast-util-interactive)
    — Check if a node is interactive;
*   [`hast-util-is-body-ok-link`](https://github.com/wooorm/rehype-minify/tree/master/packages/hast-util-is-body-ok-link)
    — Check if a `link` element is “Body OK”;
*   [`hast-util-is-conditional-comment`](https://github.com/wooorm/rehype-minify/tree/master/packages/hast-util-is-conditional-comment)
    — Check if `node` is a conditional comment;
*   [`hast-util-is-css-link`](https://github.com/wooorm/rehype-minify/tree/master/packages/hast-util-is-css-link)
    — Check if `node` is a CSS `link`;
*   [`hast-util-is-css-style`](https://github.com/wooorm/rehype-minify/tree/master/packages/hast-util-is-css-style)
    — Check if `node` is a CSS `style`;
*   [`hast-util-is-element`](https://github.com/syntax-tree/hast-util-is-element)
    — Check if `node` is a (certain) element;
*   [`hast-util-is-event-handler`](https://github.com/wooorm/rehype-minify/tree/master/packages/hast-util-is-event-handler)
    — Check if `property` is an event handler;
*   [`hast-util-is-javascript`](https://github.com/wooorm/rehype-minify/tree/master/packages/hast-util-is-javascript)
    — Check if `node` is a JavaScript `script`;
*   [`hast-util-labelable`](https://github.com/syntax-tree/hast-util-labelable)
    — Check if `node` is labelable;
*   [`hast-util-menu-state`](https://github.com/syntax-tree/hast-util-menu-state)
    — Check the state of a menu element;
*   [`hast-util-parse-selector`](https://github.com/syntax-tree/hast-util-parse-selector)
    — Create an element from a simple CSS selector;
*   [`hast-util-phrasing`](https://github.com/syntax-tree/hast-util-phrasing)
    — Check if a node is phrasing content;
*   [`hast-util-raw`](https://github.com/syntax-tree/hast-util-raw)
    — Reparse a HAST tree;
*   [`hast-util-sanitize`](https://github.com/syntax-tree/hast-util-sanitize)
    — Sanitise nodes;
*   [`hast-util-select`](https://github.com/syntax-tree/hast-util-select)
    — `querySelector`, `querySelectorAll`, and `matches`;
*   [`hast-util-script-supporting`](https://github.com/syntax-tree/hast-util-script-supporting)
    — Check if `node` is script-supporting content;
*   [`hast-util-sectioning`](https://github.com/syntax-tree/hast-util-sectioning)
    — Check if `node` is sectioning content;
*   [`hast-util-to-html`](https://github.com/syntax-tree/hast-util-to-html)
    — Stringify nodes to HTML;
*   [`hast-util-to-mdast`](https://github.com/syntax-tree/hast-util-to-mdast)
    — Transform HAST to MDAST;
*   [`hast-util-to-nlcst`](https://github.com/syntax-tree/hast-util-to-nlcst)
    — Transform HAST to NLCST;
*   [`hast-util-to-parse5`](https://github.com/syntax-tree/hast-util-to-parse5)
    — Transform HAST to Parse5’s AST;
*   [`hast-util-to-string`](https://github.com/syntax-tree/rehype-minify/tree/master/packages/hast-util-to-string)
    — Get the plain-text value of a node;
*   [`hast-util-transparent`](https://github.com/syntax-tree/hast-util-transparent)
    — Check if `node` is transparent content;
*   [`hast-util-whitespace`](https://github.com/syntax-tree/hast-util-whitespace)
    — Check if `node` is inter-element whitespace;

See the [List of Unist Utilities][unist-utility] for projects which
work with **HAST** nodes too.

## Related HTML Utilities

*   [`a-rel`](https://github.com/wooorm/a-rel)
    — List of link types for `rel` on `a` / `area`;
*   [`aria-attributes`](https://github.com/wooorm/aria-attributes)
    — List of ARIA attributes;
*   [`collapse-white-space`](https://github.com/wooorm/collapse-white-space)
    — Replace multiple white-space characters with a single space;
*   [`comma-separated-tokens`](https://github.com/wooorm/comma-separated-tokens)
    — Parse/stringify comma-separated tokens;
*   [`html-tag-names`](https://github.com/wooorm/html-tag-names)
    — List of HTML tag-names;
*   [`html-dangerous-encodings`](https://github.com/wooorm/html-dangerous-encodings)
    — List of dangerous HTML character encoding labels;
*   [`html-encodings`](https://github.com/wooorm/html-encodings)
    — List of HTML character encoding labels;
*   [`html-element-attributes`](https://github.com/wooorm/html-element-attributes)
    — Map of HTML attributes;
*   [`html-void-elements`](https://github.com/wooorm/html-void-elements)
    — List of void HTML tag-names;
*   [`link-rel`](https://github.com/wooorm/link-rel)
    — List of link types for `rel` on `link`;
*   [`mathml-tag-names`](https://github.com/wooorm/mathml-tag-names)
    — List of MathML tag-names;
*   [`meta-name`](https://github.com/wooorm/meta-name)
    — List of values for `name` on `meta`;
*   [`property-information`](https://github.com/wooorm/property-information)
    — Information on HTML properties;
*   [`space-separated-tokens`](https://github.com/wooorm/space-separated-tokens)
    — Parse/stringify space-separated tokens;
*   [`svg-tag-names`](https://github.com/wooorm/svg-tag-names)
    — List of SVG tag-names;
*   [`svg-element-attributes`](https://github.com/wooorm/svg-element-attributes)
    — Map of SVG attributes;
*   [`web-namespaces`](https://github.com/wooorm/web-namespaces)
    — Map of web namespaces.

## AST

### `Root`

**Root** ([**Parent**][parent]) houses all nodes.

```idl
interface Root <: Parent {
  type: "root";
}
```

### `Element`

**Element** ([**Parent**][parent]) represents an HTML Element.  For example,
a `div`.  HAST Elements corresponds to the [HTML Element][html-element]
interface.

```idl
interface Element <: Parent {
  type: "element";
  tagName: string;
  properties: Properties;
}
```

For example, the following HTML:

```html
<a href="http://alpha.com" class="bravo" download></a>
```

Yields:

```json
{
  "type": "element",
  "tagName": "a",
  "properties": {
    "href": "http://alpha.com",
    "id": "bravo",
    "className": ["bravo"],
    "download": true
  },
  "children": []
}
```

#### `Properties`

A dictionary of property names to property values.  Most virtual DOMs
require a disambiguation between `attributes` and `properties`.  HAST
does not and defers this to compilers.

```idl
interface Properties {}
```

##### Property names

Property names are keys on [`properties`][properties] objects and
reflect HTML attribute names.  Often, they have the same value as
the corresponding HTML attribute (for example, `href` is a property
name reflecting the `href` attribute name).
If the HTML attribute name contains one or more dashes, the HAST
property name must be camel-cased (for example, `ariaLabel` is a
property reflecting the `aria-label` attribute).
If the HTML attribute is a reserved ECMAScript keyword, a common
alternative must be used.  This is the case for `class`, which uses
`className` in HAST (and DOM), and `for`, which uses `htmlFor`.

> DOM uses other prefixes and suffixes too, for example, `relList`
> for HTML `rel` attributes.  This does not occur in HAST.

When possible, HAST properties must be camel-cased if the HTML property
name originates from multiple words.  For example, the `minlength` HTML
attribute is cased as `minLength`, and `typemustmatch` as `typeMustMatch`.

##### Property values

Property values should reflect the data type determined by their
property name.  For example, the following HTML `<div hidden></div>`
contains a `hidden` (boolean) attribute, which is reflected as a `hidden`
property name set to `true` (boolean) as value in HAST, and
`<input minlength="5">`, which contains a `minlength` (valid
non-negative integer) attribute, is reflected as a property `minLength`
set to `5` (number) in HAST.

> In JSON, the property value `null` must be treated as if the
> property was not included.
> In JavaScript, both `null` and `undefined` must be similarly
> ignored.

The DOM is strict in reflecting those properties, and HAST is not,
where the DOM treats `<div hidden=no></div>` as having a `true`
(boolean) value for the `hidden` attribute, and `<img width="yes">`
as having a `0` (number) value for the `width` attribute, these should
be reflected as `'no'` and `'yes'`, respectively, in HAST.

> The reason for this is to allow plug-ins and utilities to inspect
> these values.

The DOM also specifies comma- and space-separated lists attribute
values.  In HAST, these should be treated as ordered lists.
For example, `<div class="alpha bravo"></div>` is represented as
`['alpha', 'bravo']`.

> There’s no special format for `style`.

### `Doctype`

**Doctype** ([**Node**][node]) defines the type of the document.

```idl
interface Doctype <: Node {
  type: "doctype";
  name: string;
  public: string?;
  system: string?;
}
```

For example, the following HTML:

```html
<!DOCTYPE html>
```

Yields:

```json
{
  "type": "doctype",
  "name": "html",
  "public": null,
  "system": null
}
```

### `Comment`

**Comment** ([**Text**][text]) represents embedded information.

```idl
interface Comment <: Text {
  type: "comment";
}
```

For example, the following HTML:

```html
<!--Charlie-->
```

Yields:

```json
{
  "type": "comment",
  "value": "Charlie"
}
```

### `Text`

**TextNode** ([**Text**][text]) represents everything that is text.
Note that its `type` property is `text`, but it is different
from the abstract **Unist** interface **Text**.

```idl
interface TextNode <: Text {
  type: "text";
}
```

For example, the following HTML:

```html
<span>Foxtrot</span>
```

Yields:

```json
{
  "type": "element",
  "tagName": "span",
  "properties": {},
  "children": [{
    "type": "text",
    "value": "Foxtrot"
  }]
}
```

## Related

*   [rehype][]
*   [Unist][]
*   [VFile][]
*   [NLCST][]
*   [MDAST][]

<!-- Definitions -->

[logo]: https://cdn.rawgit.com/syntax-tree/hast/342f7b8/logo.svg

[changelog]: https://github.com/syntax-tree/hast/releases

[html-element]: https://dom.spec.whatwg.org/#interface-element

[unist-utility]: https://github.com/syntax-tree/unist#list-of-utilities

[unist]: https://github.com/syntax-tree/unist

[node]: https://github.com/syntax-tree/unist#node

[parent]: https://github.com/syntax-tree/unist#parent

[text]: https://github.com/syntax-tree/unist#text

[rehype]: https://github.com/wooorm/rehype

[nlcst]: https://github.com/syntax-tree/nlcst

[mdast]: https://github.com/syntax-tree/mdast

[vfile]: https://github.com/vfile/vfile

[properties]: #properties
