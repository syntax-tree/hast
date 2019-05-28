<!--lint disable no-html-->

# ![hast][logo]

**H**ypertext **A**bstract **S**yntax **T**ree format.

* * *

**hast** is a specification for representing [HTML][] (and embedded [SVG][] or
[MathML][]) as an abstract [syntax tree][syntax-tree].
It implements the [**unist**][unist] spec.

This document may not be released.
See [releases][] for released documents.
The latest released version is [`2.3.0`][latest].

## Table of Contents

*   [Introduction](#introduction)
    *   [Where this specification fits](#where-this-specification-fits)
    *   [Virtual DOM](#virtual-dom)
*   [Nodes](#nodes)
    *   [Parent](#parent)
    *   [Literal](#literal)
    *   [Root](#root)
    *   [Element](#element)
    *   [Doctype](#doctype)
    *   [Comment](#comment)
    *   [Text](#text)
*   [Glossary](#glossary)
*   [List of Utilities](#list-of-utilities)
*   [Related HTML Utilities](#related-html-utilities)
*   [References](#references)
*   [Contribute](#contribute)
*   [Acknowledgments](#acknowledgments)
*   [License](#license)

## Introduction

This document defines a format for representing hypertext as an [abstract
syntax tree][syntax-tree].
Development of hast started in April 2016 for [rehype][].
This specification is written in a [Web IDL][webidl]-like grammar.

### Where this specification fits

hast extends [unist][], a format for syntax trees, to benefit from its
[ecosystem of utilities][utilities].

hast relates to [JavaScript][] in that it has an [ecosystem of
utilities][list-of-utilities] for working with compliant syntax trees in
JavaScript.
However, hast is not limited to JavaScript and can be used in other
programming languages.

hast relates to the [unified][] and [rehype][] projects in that hast syntax
trees are used throughout their ecosystems.

### Virtual DOM

The reason for introducing a new “virtual” DOM is primarily:

*   The DOM is very heavy to implement outside of the browser,
    a lean and stripped down virtual DOM can be used everywhere
*   Most virtual DOMs do not focus on ease of use in transformations
*   Other virtual DOMs cannot represent the syntax of HTML in its
    entirety (think comments and document types)
*   Neither HTML nor virtual DOMs focus on positional information

## Nodes

### `Parent`

```idl
interface Parent <: UnistParent {
  children: [Element | Doctype | Comment | Text]
}
```

**Parent** ([**UnistParent**][dfn-unist-parent]) represents a node in hast
containing other nodes (said to be [_children_][term-child]).

Its content is limited to only other hast content.

### `Literal`

```idl
interface Literal <: UnistLiteral {
  value: string
}
```

**Literal** ([**UnistLiteral**][dfn-unist-literal]) represents a node in hast
containing a value.

### `Root`

```idl
interface Root <: Parent {
  type: "root"
}
```

**Root** ([**Parent**][dfn-parent]) represents a document.

**Root** can be used as the [_root_][term-root] of a [_tree_][term-tree], or as
a value of the `content` field on a `'template'` [**Element**][dfn-element],
never as a [_child_][term-child].

### `Element`

```idl
interface Element <: Parent {
  type: "element"
  tagName: string
  properties: Properties?
  content: Root?
  children: [Element | Comment | Text]
}
```

**Element** ([**Parent**][dfn-parent]) represents an [HTML
Element][concept-element].

A `tagName` field must be present.
It represents the element’s [local name][concept-local-name].

The `properties` field represents information associated with the element.
The value of the `properties` field implements the
[**Properties**][dfn-properties] interface.

If the `tagName` field is `'template'`, a `content` field can be present.
The value of the `content` field implements the [**Root**][dfn-root] interface.

If the `tagName` field is `'template'`, the element must be a
[_leaf_][term-leaf].

If the `tagName` field is `'noscript'`, its [_children_][term-child] should
be represented as if [_scripting is disabled_][concept-scripting].

For example, the following HTML:

```html
<a href="http://alpha.com" class="bravo" download></a>
```

Yields:

```javascript
{
  type: 'element',
  tagName: 'a',
  properties: {
    href: 'http://alpha.com',
    className: ['bravo'],
    download: true
  },
  children: []
}
```

#### `Properties`

```idl
interface Properties {}
```

**Properties** represents information associated with an element.

Every field must be a [**PropertyName**][dfn-property-name] and every value a
[**PropertyValue**][dfn-property-value].

#### `PropertyName`

```idl
typedef string PropertyName
```

Property names are keys on [**Properties**][dfn-properties] objects and reflect
HTML, SVG, ARIA, XML, XMLNS, or XLink attribute names.
Often, they have the same value as the corresponding attribute (for example,
`id` is a property name reflecting the `id` attribute name), but there are some
notable differences.

> These rules aren’t simple.
> Use [`hastscript`][h] (or [`property-information`][pi] directly) to help.

The following rules are used to transform HTML attribute names to property
names.
These rules are based on [how ARIA is reflected in the
DOM][concept-aria-reflection], and differs from how some (older) HTML attributes
are reflected in the DOM.

1.  Any name referencing a combinations of multiple words (such as “stroke
    miter limit”) becomes a camel-cased property name capitalising each word
    boundary.
    This includes combinations that are sometimes written as several words.
    For example, `stroke-miterlimit` becomes `strokeMiterLimit`, `autocorrect`
    becomes `autoCorrect`, and `allowfullscreen` becomes `allowFullScreen`.
2.  Any name that can be hyphenated, becomes a camel-cased property name
    capitalising each boundary.
    For example, “read-only” becomes `readOnly`.
3.  Compound words that are not used with spaces or hyphens are treated as a
    normal word and the previous rules apply.
    For example, “placeholder”, “strikethrough”, and “playback” stay the same.
4.  Acronyms in names are treated as a normal word and the previous rules apply.
    For example, `itemid` become `itemId` and `bgcolor` becomes `bgColor`.

###### Exceptions

Some jargon is seen as one word even though it may not be seen as such by
dictionaries.
For example, `nohref` becomes `noHref`, `playsinline` becomes `playsInline`,
and `accept-charset` becomes `acceptCharset`.

The HTML attributes `class` and `for` respectively become `className` and
`htmlFor` in alignment with the DOM.
No other attributes gain different names as properties, other than a change in
casing.

###### Notes

The property name rules differ from how HTML is reflected in the DOM for the
following attributes:

<details>
<summary>View list of differences</summary>

*   `charoff` becomes `charOff` (not `chOff`)
*   `char` stays `char` (does not become `ch`)
*   `rel` stays `rel` (does not become `relList`)
*   `checked` stays `checked` (does not become `defaultChecked`)
*   `muted` stays `muted` (does not become `defaultMuted`)
*   `value` stays `value` (does not become `defaultValue`)
*   `selected` stays `selected` (does not become `defaultSelected`)
*   `allowfullscreen` becomes `allowFullScreen` (not `allowFullscreen`)
*   `hreflang` becomes `hrefLang`, not `hreflang`
*   `autoplay` becomes `autoPlay`, not `autoplay`
*   `autocomplete` becomes `autoComplete` (not `autocomplete`)
*   `autofocus` becomes `autoFocus`, not `autofocus`
*   `enctype` becomes `encType`, not `enctype`
*   `formenctype` becomes `formEncType` (not `formEnctype`)
*   `vspace` becomes `vSpace`, not `vspace`
*   `hspace` becomes `hSpace`, not `hspace`
*   `lowsrc` becomes `lowSrc`, not `lowsrc`

</details>

#### `PropertyValue`

```idl
typedef any PropertyValue
```

Property values should reflect the data type determined by their property name.
For example, the HTML `<div hidden></div>` has a `hidden` attribute, which is
reflected as a `hidden` property name set to the property value `true`, and
`<input minlength="5">`, which has a `minlength` attribute, is reflected as a
`minLength` property name set to the property value `5`.

> In [JSON][], the value `null` must be treated as if the property was not
> included.
> In [JavaScript][], both `null` and `undefined` must be similarly ignored.

The DOM has strict rules on how it coerces HTML to expected values, whereas
hast is more lenient in how it reflects the source.
Where the DOM treats `<div hidden="no"></div>` as having a value of `true` and
`<img width="yes">` as having a value of `0`, these should be reflected as
`'no'` and `'yes'`, respectively, in hast.

> The reason for this is to allow plug-ins and utilities to inspect these
> non-standard values.

The DOM also specifies comma- and space-separated lists attribute values.
In hast, these should be treated as ordered lists.
For example, `<div class="alpha bravo"></div>` is represented as `['alpha',
'bravo']`.

> There’s no special format for the property value of the `style` property name.

### `Doctype`

```idl
interface Doctype <: Node {
  type: "doctype"
  name: string
  public: string?
  system: string?
}
```

**Doctype** ([**Node**][dfn-unist-node]) represents an [HTML
DocumentType][concept-documenttype].

A `name` field must be present.

A `public` field can be present.
If present, it must be set to a string, and represents the document’s public
identifier.

A `system` field can be present.
If system, it must be set to a string, and represents the document’s system
identifier.

For example, the following HTML:

```html
<!doctype html>
```

Yields:

```javascript
{
  type: 'doctype',
  name: 'html',
  public: null,
  system: null
}
```

### `Comment`

```idl
interface Comment <: Literal {
  type: "comment"
}
```

**Comment** ([**Literal**][dfn-literal]) represents an [HTML
Comment][concept-comment].

For example, the following HTML:

```html
<!--Charlie-->
```

Yields:

```javascript
{
  type: 'comment',
  value: 'Charlie'
}
```

### `Text`

```idl
interface Text <: Literal {
  type: "text"
}
```

**Text** ([**Literal**][dfn-literal]) represents an [HTML Text][concept-text].

For example, the following HTML:

```html
<span>Foxtrot</span>
```

Yields:

```javascript
{
  type: 'element',
  tagName: 'span',
  properties: {},
  children: [{type: 'text', value: 'Foxtrot'}]
}
```

## Glossary

See the [unist glossary][glossary].

## List of Utilities

See the [unist list of utilities][utilities] for more utilities.

<!--
Utilities.
The first two are special.
The rest is sorted alphabetically based on content after `hast-util-`
-->

*   [`hastscript`](https://github.com/syntax-tree/hastscript)
    — Hyperscript compatible DSL for creating nodes
*   [`hast-to-hyperscript`](https://github.com/syntax-tree/hast-to-hyperscript)
    — Convert a Node to React, Virtual DOM, Hyperscript, and more
*   [`hast-util-assert`](https://github.com/syntax-tree/hast-util-assert)
    — Assert HAST nodes
*   [`hast-util-class-list`](https://github.com/brechtcs/hast-util-class-list)
    — Simulate the browser’s `classList` API for HAST nodes 
*   [`hast-util-embedded`](https://github.com/syntax-tree/hast-util-embedded)
    — Check if `node` is embedded content
*   [`hast-util-find-and-replace`](https://github.com/syntax-tree/hast-util-find-and-replace)
    — Find and replace text
*   [`hast-util-from-parse5`](https://github.com/syntax-tree/hast-util-from-parse5)
    — Transform Parse5’s AST to HAST
*   [`hast-util-from-string`](https://github.com/rehypejs/rehype-minify/tree/master/packages/hast-util-from-string)
    — Set the plain-text value of a node
*   [`hast-util-from-webparser`](https://github.com/Prettyhtml/prettyhtml/tree/master/packages/hast-util-from-webparser)
    — Transform Webparser’s AST to HAST
*   [`hast-util-has-property`](https://github.com/syntax-tree/hast-util-has-property)
    — Check if a node has a property
*   [`hast-util-heading`](https://github.com/syntax-tree/hast-util-heading)
    — Check if a node is heading content
*   [`hast-util-interactive`](https://github.com/syntax-tree/hast-util-interactive)
    — Check if a node is interactive
*   [`hast-util-is-body-ok-link`](https://github.com/rehypejs/rehype-minify/tree/master/packages/hast-util-is-body-ok-link)
    — Check if a `link` element is “Body OK”
*   [`hast-util-is-conditional-comment`](https://github.com/rehypejs/rehype-minify/tree/master/packages/hast-util-is-conditional-comment)
    — Check if `node` is a conditional comment
*   [`hast-util-is-css-link`](https://github.com/rehypejs/rehype-minify/tree/master/packages/hast-util-is-css-link)
    — Check if `node` is a CSS `link`
*   [`hast-util-is-css-style`](https://github.com/rehypejs/rehype-minify/tree/master/packages/hast-util-is-css-style)
    — Check if `node` is a CSS `style`
*   [`hast-util-is-element`](https://github.com/syntax-tree/hast-util-is-element)
    — Check if `node` is a (certain) element
*   [`hast-util-is-event-handler`](https://github.com/rehypejs/rehype-minify/tree/master/packages/hast-util-is-event-handler)
    — Check if `property` is an event handler
*   [`hast-util-is-javascript`](https://github.com/rehypejs/rehype-minify/tree/master/packages/hast-util-is-javascript)
    — Check if `node` is a JavaScript `script`
*   [`hast-util-labelable`](https://github.com/syntax-tree/hast-util-labelable)
    — Check if `node` is labelable
*   [`hast-util-menu-state`](https://github.com/syntax-tree/hast-util-menu-state)
    — Check the state of a menu element
*   [`hast-util-parse-selector`](https://github.com/syntax-tree/hast-util-parse-selector)
    — Create an element from a simple CSS selector
*   [`hast-util-phrasing`](https://github.com/syntax-tree/hast-util-phrasing)
    — Check if a node is phrasing content
*   [`hast-util-raw`](https://github.com/syntax-tree/hast-util-raw)
    — Reparse a HAST tree
*   [`hast-util-sanitize`](https://github.com/syntax-tree/hast-util-sanitize)
    — Sanitise nodes
*   [`hast-util-select`](https://github.com/syntax-tree/hast-util-select)
    — `querySelector`, `querySelectorAll`, and `matches`
*   [`hast-util-script-supporting`](https://github.com/syntax-tree/hast-util-script-supporting)
    — Check if `node` is script-supporting content
*   [`hast-util-sectioning`](https://github.com/syntax-tree/hast-util-sectioning)
    — Check if `node` is sectioning content
*   [`hast-util-table-cell-style`](https://github.com/mapbox/hast-util-table-cell-style)
    — Transform deprecated styling attributes on table cells to inline styles
*   [`hast-util-to-dom`](https://github.com/syntax-tree/hast-util-to-dom)
    — Transform to a DOM tree
*   [`hast-util-to-html`](https://github.com/syntax-tree/hast-util-to-html)
    — Stringify nodes to HTML
*   [`hast-util-to-mdast`](https://github.com/syntax-tree/hast-util-to-mdast)
    — Transform HAST to MDAST
*   [`hast-util-to-nlcst`](https://github.com/syntax-tree/hast-util-to-nlcst)
    — Transform HAST to NLCST
*   [`hast-util-to-parse5`](https://github.com/syntax-tree/hast-util-to-parse5)
    — Transform HAST to Parse5’s AST
*   [`hast-util-to-string`](https://github.com/rehypejs/rehype-minify/tree/master/packages/hast-util-to-string)
    — Get the plain-text value of a node
*   [`hast-util-transparent`](https://github.com/syntax-tree/hast-util-transparent)
    — Check if `node` is transparent content
*   [`hast-util-whitespace`](https://github.com/syntax-tree/hast-util-whitespace)
    — Check if `node` is inter-element whitespace

## Related HTML Utilities

*   [`a-rel`](https://github.com/wooorm/a-rel)
    — List of link types for `rel` on `a` / `area`
*   [`aria-attributes`](https://github.com/wooorm/aria-attributes)
    — List of ARIA attributes
*   [`collapse-white-space`](https://github.com/wooorm/collapse-white-space)
    — Replace multiple white-space characters with a single space
*   [`comma-separated-tokens`](https://github.com/wooorm/comma-separated-tokens)
    — Parse/stringify comma-separated tokens
*   [`html-tag-names`](https://github.com/wooorm/html-tag-names)
    — List of HTML tag-names
*   [`html-dangerous-encodings`](https://github.com/wooorm/html-dangerous-encodings)
    — List of dangerous HTML character encoding labels
*   [`html-encodings`](https://github.com/wooorm/html-encodings)
    — List of HTML character encoding labels
*   [`html-element-attributes`](https://github.com/wooorm/html-element-attributes)
    — Map of HTML attributes
*   [`html-void-elements`](https://github.com/wooorm/html-void-elements)
    — List of void HTML tag-names
*   [`link-rel`](https://github.com/wooorm/link-rel)
    — List of link types for `rel` on `link`
*   [`mathml-tag-names`](https://github.com/wooorm/mathml-tag-names)
    — List of MathML tag-names
*   [`meta-name`](https://github.com/wooorm/meta-name)
    — List of values for `name` on `meta`
*   [`property-information`](https://github.com/wooorm/property-information)
    — Information on HTML properties
*   [`space-separated-tokens`](https://github.com/wooorm/space-separated-tokens)
    — Parse/stringify space-separated tokens
*   [`svg-tag-names`](https://github.com/wooorm/svg-tag-names)
    — List of SVG tag-names
*   [`svg-element-attributes`](https://github.com/wooorm/svg-element-attributes)
    — Map of SVG attributes
*   [`web-namespaces`](https://github.com/wooorm/web-namespaces)
    — Map of web namespaces

## References

*   **unist**:
    [Universal Syntax Tree][unist].
    T. Wormer; et al.
*   **JavaScript**
    [ECMAScript Language Specification][javascript].
    Ecma International.
*   **HTML**:
    [HTML Standard][html],
    A. van Kesteren; et al.
    WHATWG.
*   **SVG**:
    [Scalable Vector Graphics (SVG)][svg],
    N. Andronikos,
    R. Atanassov,
    T. Bah,
    B. Birtles,
    B. Brinza,
    C. Concolato,
    E. Dahlström,
    C. Lilley,
    C. McCormack,
    D. Schepers,
    R. Schwerdtfeger,
    D. Storey,
    S. Takagi,
    J. Watt.
    W3C.
*   **MathML**:
    [Mathematical Markup Language Standard][mathml],
    D. Carlisle,
    P. Ion,
    R. Miner.
    W3C.
*   **ARIA**:
    [Accessible Rich Internet Applications (WAI-ARIA)][aria],
    J. Diggs,
    J. Craig,
    S. McCarron,
    M. Cooper.
    W3C.
*   **JSON**
    [The JavaScript Object Notation (JSON) Data Interchange Format][json],
    T. Bray.
    IETF.
*   **Web IDL**:
    [Web IDL][webidl],
    C. McCormack.
    W3C.

## Contribute

**hast** is built by people just like you!
Check out [`contributing.md`][contributing] for ways to get started.

This project has a [Code of Conduct][coc].
By interacting with this repository, organisation, or community you agree to
abide by its terms.

Want to chat with the community and contributors?
Join us in [spectrum][chat]!

Have an idea for a cool new utility or tool?
That’s great!
If you want feedback, help, or just to share it with the world you can do so by
creating an issue in the [`syntax-tree/ideas`][ideas] repository!

## Acknowledgments

The initial release of this project was authored by
[**@wooorm**](https://github.com/wooorm).

Special thanks to [**@eush77**](https://github.com/eush77) for their work,
ideas, and incredibly valuable feedback!

Thanks to
[**@kthjm**](https://github.com/kthjm)
[**@KyleAMathews**](https://github.com/KyleAMathews),
[**@rhysd**](https://github.com/rhysd),
[**@Rokt33r**](https://github.com/Rokt33r),
[**@s1n**](https://github.com/s1n),
[**@Sarah-Seo**](https://github.com/Sarah-Seo),
[**@sethvincent**](https://github.com/sethvincent), and
[**@simov**](https://github.com/simov)
for contributing to hast and related projects!

## License

[CC-BY-4.0][license] © [Titus Wormer][author]

<!-- Definitions -->

[contributing]: contributing.md

[coc]: code-of-conduct.md

[license]: https://creativecommons.org/licenses/by/4.0/

[author]: https://wooorm.com

[logo]: https://raw.githubusercontent.com/syntax-tree/hast/ec9bdf3/logo.svg?sanitize=true

[ideas]: https://github.com/syntax-tree/ideas

[chat]: https://spectrum.chat/unified/rehype

[releases]: https://github.com/syntax-tree/hast/releases

[latest]: https://github.com/syntax-tree/hast/releases/tag/2.3.0

[dfn-unist-node]: https://github.com/syntax-tree/unist#node

[dfn-unist-parent]: https://github.com/syntax-tree/unist#parent

[dfn-unist-literal]: https://github.com/syntax-tree/unist#literal

[list-of-utilities]: #list-of-utilities

[unist]: https://github.com/syntax-tree/unist

[syntax-tree]: https://github.com/syntax-tree/unist#syntax-tree

[javascript]: https://www.ecma-international.org/ecma-262/9.0/index.html

[html]: https://html.spec.whatwg.org/multipage/

[svg]: https://svgwg.org/svg2-draft/

[mathml]: https://www.w3.org/Math/draft-spec/

[aria]: https://w3c.github.io/aria/

[json]: https://tools.ietf.org/html/rfc7159

[webidl]: https://heycam.github.io/webidl/

[glossary]: https://github.com/syntax-tree/unist#glossary

[utilities]: https://github.com/syntax-tree/unist#list-of-utilities

[unified]: https://github.com/unifiedjs/unified

[rehype]: https://github.com/rehypejs/rehype

[h]: https://github.com/syntax-tree/hastscript

[pi]: https://github.com/wooorm/property-information

[concept-element]: https://dom.spec.whatwg.org/#interface-element

[concept-local-name]: https://dom.spec.whatwg.org/#concept-element-local-name

[concept-documenttype]: https://dom.spec.whatwg.org/#documenttype

[concept-comment]: https://dom.spec.whatwg.org/#interface-comment

[concept-text]: https://dom.spec.whatwg.org/#interface-text

[concept-scripting]: https://html.spec.whatwg.org/#enabling-and-disabling-scripting

[concept-aria-reflection]: https://w3c.github.io/aria/#idl_attr_disambiguation

[term-tree]: https://github.com/syntax-tree/unist#tree

[term-child]: https://github.com/syntax-tree/unist#child

[term-root]: https://github.com/syntax-tree/unist#root

[term-leaf]: https://github.com/syntax-tree/unist#leaf

[dfn-parent]: #parent

[dfn-literal]: #literal

[dfn-root]: #root

[dfn-element]: #element

[dfn-properties]: #properties

[dfn-property-name]: #propertyname

[dfn-property-value]: #propertyvalue
