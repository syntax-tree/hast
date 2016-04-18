# ![HAST][logo]

**H**ypertext **A**bstract **S**yntax **T**ree format.

***

> :information_desk_person: I’m working on **rehype**, which uses
> this format.  A very alpha version of rehype was previously
> published here as `hast`.  It’s still published on
> [npm](http://npmjs.com/hast) though.  **rehype** will be published
> soon.
>
> Early feedback is greatly appreciated!

**HAST** discloses HTML as an abstract syntax tree.  _Abstract_
means not all information is stored in this tree and an exact replica
of the original document cannot be re-created.  _Syntax Tree_ means syntax
**is** present in the tree, thus an exact syntactic document can be
re-created.

The reason for introducing a new “virtual” DOM is manyfold, primarily:

*   The DOM is very heavy to implement outside of the browser;
    a lean, stripped down virtual DOM can be used everywhere;

*   Most virtual DOMs do not focus on easy of use in transformations;

*   Other virtual DOMs cannot represent the syntax of HTML in its
    entirety, think comments, document types, and character data;

*   Neither HTML nor virtual DOMs focus on positional information.

**HAST** is a subset of [Unist][].

## List of Utilities

<!-- Special -->

*   [`wooorm/hastscript`](https://github.com/wooorm/hastscript)
    — Hyperscript compatible DSL for creating nodes;

*   [`wooorm/hast-to-hyperscript`](https://github.com/wooorm/hast-to-hyperscript)
    — Convert a HAST Node through to React, Virtual DOM, Hyperscript, and more;

<!--
Normal utilities.  Sorted alphabetically based on content
after `hast-util-`
-->

*   [`wooorm/hast-util-embedded`](https://github.com/wooorm/hast-util-embedded)
    — Check if a node is embedded content;

*   [`wooorm/hast-util-has-property`](https://github.com/wooorm/hast-util-has-property)
    — Check if a node has a property;

*   [`wooorm/hast-util-heading`](https://github.com/wooorm/hast-util-heading)
    — Check if a node is heading content;

*   [`wooorm/hast-util-interactive`](https://github.com/wooorm/hast-util-interactive)
    — Check if a node is interactive;

*   [`wooorm/hast-util-is-element`](https://github.com/wooorm/hast-util-is-element)
    — Check if a node is a (certain) element;

*   [`wooorm/hast-util-labelable`](https://github.com/wooorm/hast-util-labelable)
    — Check if a node is labelable;

*   [`wooorm/hast-util-menu-state`](https://github.com/wooorm/hast-util-menu-state)
    — Check the state of a menu element;

*   [`wooorm/hast-util-parse-selector`](https://github.com/wooorm/hast-util-parse-selector)
    — Create a node from a simple CSS selector;

*   [`wooorm/hast-util-script-supporting`](https://github.com/wooorm/hast-util-script-supporting)
    — Check if a node is script-supporting content;

*   [`wooorm/hast-util-sectioning`](https://github.com/wooorm/hast-util-sectioning)
    — Check if a node is sectioning content;

*   [`wooorm/hast-util-transparent`](https://github.com/wooorm/hast-util-transparent)
    — Check if a node is transparent content;

*   [`wooorm/hast-util-whitespace`](https://github.com/wooorm/hast-util-whitespace)
    — Check if a node is inter-element whitespace;

See the [List of Unist Utilities][unist-utility] for projects which
work with **HAST** nodes too.

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
contains a `hidden` (boolean) attribute, which is reflected a `hidden`
property name set to `true` (boolean) as value in HAST, and
`<input minlength="5">`, which contains a `minlength` (valid
non-negative integer) attribute, is reflected as a property `minLength`
set to `5` (number) in HAST.

> In JSON, the value property value `null` must be treated as if the
> property was not included.
> In JavaScript, both `null` and `undefined` must be similarly
> ignored.

The DOM is strict in reflecting those properties, and HAST is not,
where the DOM treats `<div hidden=no></div>` as having a `true`
(boolean) value for the `hidden` attribute, and `<img width="yes">`
as having a `0` (number) value for the `width` attribute, these should
be reflected as `"no"` and `"yes"`, respectively, in HAST.

> The reason for this is to allow plug-ins and utilities to inspect
> these values.

The DOM also specifies comma- and space-separated lists attribute
values.  In HAST, these should be treated as ordered lists. For example,
`<div class="alpha bravo"></div>` is represented as
`["alpha", "bravo"]`.

> :warning: I’m unsure whether the value of `style` properties
> should be exposed as an `object`: it’s nice for easy access but
> would not work well for transformations, as CSS properties cascade
> by order, which cannot be represented by JavaScript Objects.

### `Directive`

**Directive** ([**Text**][text]) represents an instruction
(declaration or processing instruction).

```idl
interface Directive <: Text {
  type: "directive";
  name: string;
}
```

For example, the following HTML:

```html
<!doctype html>
```

Yields:

```json
{
  "type": "directive",
  "name": "!doctype",
  "value": "!doctype html"
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

### `CharacterData`

**CharacterData** ([**Text**][text]) represents character data.

```idl
interface CharacterData <: Text {
  type: "characterData";
}
```

For example, the following HTML:

```html
<![CDATA[<delta>Echo</delta>]]>
```

Yields:

```json
{
  "type": "characterData",
  "value": "<delta>Echo</delta>"
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

*   [Unist][]
*   [vfile][]
*   rehype

<!-- Definitions -->

[logo]: https://cdn.rawgit.com/wooorm/hast/master/logo.svg

[vfile]: https://github.com/wooorm/vfile

[html-element]: https://dom.spec.whatwg.org/#interface-element

[unist-utility]: https://github.com/wooorm/unist#list-of-utilities

[unist]: https://github.com/wooorm/unist

[parent]: https://github.com/wooorm/unist#parent

[text]: https://github.com/wooorm/unist#text

[properties]: #properties
