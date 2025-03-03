<!--lint disable no-html-->

# ![hast][github-hast-logo]

**H**ypertext **A**bstract **S**yntax **T**ree format.

***

**hast** is a specification for representing [HTML][whatwg-html]
(and embedded [SVG][w3c-svg] or [MathML][w3c-mathml])
as an abstract syntax tree.
It implements the **[unist][github-unist]** spec.

This document may not be released.
See [releases][github-hast-releases] for released documents.
The latest released version is [`2.4.0`][github-hast-release].

## Contents

* [Introduction](#introduction)
  * [Where this specification fits](#where-this-specification-fits)
  * [Virtual DOM](#virtual-dom)
* [Types](#types)
* [Nodes (abstract)](#nodes-abstract)
  * [`Literal`](#literal)
  * [`Parent`](#parent)
* [Nodes](#nodes)
  * [`Comment`](#comment)
  * [`Doctype`](#doctype)
  * [`Element`](#element)
  * [`Root`](#root)
  * [`Text`](#text)
* [Other types](#other-types)
  * [`Properties`](#properties)
  * [`PropertyName`](#propertyname)
  * [`PropertyValue`](#propertyvalue)
* [Glossary](#glossary)
* [List of utilities](#list-of-utilities)
* [Related HTML utilities](#related-html-utilities)
* [References](#references)
* [Security](#security)
* [Related](#related)
* [Contribute](#contribute)
* [Acknowledgments](#acknowledgments)
* [License](#license)

## Introduction

This document defines a format for representing hypertext as an
[abstract syntax tree][github-unist-syntax-tree].
Development of hast started in April 2016 for [rehype][github-rehype].
This specification is written in a [Web IDL][whatwg-webidl]-like grammar.

### Where this specification fits

hast extends [unist][github-unist],
a format for syntax trees,
to benefit from its [ecosystem of utilities][github-unist-utilities].

hast relates to [JavaScript][ecma-javascript] in that it has an
[ecosystem of utilities][section-utilities]
for working with compliant syntax trees in JavaScript.
However,
hast is not limited to JavaScript and can be used in other programming
languages.

hast relates to the [unified][github-unified] and [rehype][github-rehype]
projects in that hast syntax trees are used throughout their ecosystems.

### Virtual DOM

The reason for introducing a new “virtual” DOM is primarily:

* The [DOM][whatwg-dom] is very heavy to implement outside of the browser,
  a lean and stripped down virtual DOM can be used everywhere
* Most virtual DOMs do not focus on ease of use in transformations
* Other virtual DOMs cannot represent the syntax of HTML in its entirety
  (think comments and document types)
* Neither the DOM nor virtual DOMs focus on positional information

## Types

If you are using TypeScript,
you can use the hast types by installing them with npm:

```sh
npm install @types/hast
```

## Nodes (abstract)

### `Literal`

```idl
interface Literal <: UnistLiteral {
  value: string
}
```

**Literal** (**[UnistLiteral][dfn-unist-literal]**) represents a node in hast
containing a value.

### `Parent`

```idl
interface Parent <: UnistParent {
  children: [Comment | Doctype | Element | Text]
}
```

**Parent** (**[UnistParent][dfn-unist-parent]**) represents a node in hast
containing other nodes (said to be *[children][term-child]*).

Its content is limited to only other hast content.

## Nodes

### `Comment`

```idl
interface Comment <: Literal {
  type: 'comment'
}
```

**Comment** (**[Literal][dfn-literal]**) represents a [Comment][concept-comment]
([\[DOM\]][whatwg-dom]).

For example,
the following HTML:

```html
<!--Charlie-->
```

Yields:

```js
{type: 'comment', value: 'Charlie'}
```

### `Doctype`

```idl
interface Doctype <: Node {
  type: 'doctype'
}
```

**Doctype** (**[Node][dfn-unist-node]**) represents a
[DocumentType][concept-documenttype] ([\[DOM\]][whatwg-dom]).

For example,
the following HTML:

```html
<!doctype html>
```

Yields:

```js
{type: 'doctype'}
```

### `Element`

```idl
interface Element <: Parent {
  type: 'element'
  tagName: string
  properties: Properties
  content: Root?
  children: [Comment | Element | Text]
}
```

**Element** (**[Parent][dfn-parent]**) represents an [Element][concept-element]
([\[DOM\]][whatwg-dom]).

A `tagName` field must be present.
It represents the element’s [local name][concept-local-name]
([\[DOM\]][whatwg-dom]).

The `properties` field represents information associated with the element.
The value of the `properties` field implements the
**[Properties][dfn-properties]** interface.

If the `tagName` field is `'template'`,
a `content` field can be present.
The value of the `content` field implements the **[Root][dfn-root]** interface.

If the `tagName` field is `'template'`,
the element must be a *[leaf][term-leaf]*.

If the `tagName` field is `'noscript'`,
its *[children][term-child]* should be represented as if
*[scripting is disabled][concept-scripting]* ([\[HTML\]][whatwg-html]).

For example,
the following HTML:

```html
<a href="https://alpha.com" class="bravo" download></a>
```

Yields:

```js
{
  type: 'element',
  tagName: 'a',
  properties: {
    href: 'https://alpha.com',
    className: ['bravo'],
    download: true
  },
  children: []
}
```

### `Root`

```idl
interface Root <: Parent {
  type: 'root'
}
```

**Root** (**[Parent][dfn-parent]**) represents a document.

**Root** can be used as the *[root][term-root]* of a *[tree][term-tree]*,
or as a value of the `content` field on a `'template'`
**[Element][dfn-element]**,
never as a *[child][term-child]*.

### `Text`

```idl
interface Text <: Literal {
  type: 'text'
}
```

**Text** (**[Literal][dfn-literal]**) represents a [Text][concept-text]
([\[DOM\]][whatwg-dom]).

For example,
the following HTML:

```html
<span>Foxtrot</span>
```

Yields:

```js
{
  type: 'element',
  tagName: 'span',
  properties: {},
  children: [{type: 'text', value: 'Foxtrot'}]
}
```

## Other types

### `Properties`

```idl
interface Properties {}
```

**Properties** represents information associated with an element.

Every field must be a **[PropertyName][dfn-property-name]** and every value a
**[PropertyValue][dfn-property-value]**.

### `PropertyName`

```idl
typedef string PropertyName
```

Property names are keys on **[Properties][dfn-properties]** objects and reflect
HTML,
SVG,
ARIA,
XML,
XMLNS,
or XLink attribute names.
Often,
they have the same value as the corresponding attribute
(for example,
`id` is a property name reflecting the `id` attribute name),
but there are some notable differences.

> These rules aren’t simple.
> Use [`hastscript`][github-hastscript]
> (or [`property-information`][github-property-information] directly)
> to help.

The following rules are used to transform HTML attribute names to property
names.
These rules are based on
[how ARIA is reflected in the DOM][concept-aria-reflection]
([\[ARIA\]][w3c-aria]),
and differs from how some
(older)
HTML attributes are reflected in the DOM.

1. any name referencing a combinations of multiple words
   (such as “stroke miter limit”) becomes a camelcased property name
   capitalizing each word boundary;
   this includes combinations that are sometimes written as several words;
   for example,
   `stroke-miterlimit` becomes `strokeMiterLimit`,
   `autocorrect` becomes `autoCorrect`,
   and `allowfullscreen` becomes `allowFullScreen`
2. any name that can be hyphenated,
   becomes a camelcased property name capitalizing each boundary;
   for example,
   “read-only” becomes `readOnly`
3. compound words that are not used with spaces or hyphens are treated as a
   normal word and the previous rules apply;
   for example,
   “placeholder”,
   “strikethrough”,
   and “playback” stay the same
4. acronyms in names are treated as a normal word and the previous rules apply;
   for example,
   `itemid` become `itemId` and `bgcolor` becomes `bgColor`

###### Exceptions

Some jargon is seen as one word even though it may not be seen as such by
dictionaries.
For example,
`nohref` becomes `noHref`,
`playsinline` becomes `playsInline`,
and `accept-charset` becomes `acceptCharset`.

The HTML attributes `class` and `for` respectively become `className` and
`htmlFor` in alignment with the DOM.
No other attributes gain different names as properties,
other than a change in casing.

###### Notes

[`property-information`][github-property-information] lists all property names.

The property name rules differ from how HTML is reflected in the DOM for the
following attributes:

<details>
<summary>View list of differences</summary>

* `charoff` becomes `charOff` (not `chOff`)
* `char` stays `char` (does not become `ch`)
* `rel` stays `rel` (does not become `relList`)
* `checked` stays `checked` (does not become `defaultChecked`)
* `muted` stays `muted` (does not become `defaultMuted`)
* `value` stays `value` (does not become `defaultValue`)
* `selected` stays `selected` (does not become `defaultSelected`)
* `allowfullscreen` becomes `allowFullScreen` (not `allowFullscreen`)
* `hreflang` becomes `hrefLang`, not `hreflang`
* `autoplay` becomes `autoPlay`, not `autoplay`
* `autocomplete` becomes `autoComplete` (not `autocomplete`)
* `autofocus` becomes `autoFocus`, not `autofocus`
* `enctype` becomes `encType`, not `enctype`
* `formenctype` becomes `formEncType` (not `formEnctype`)
* `vspace` becomes `vSpace`, not `vspace`
* `hspace` becomes `hSpace`, not `hspace`
* `lowsrc` becomes `lowSrc`, not `lowsrc`

</details>

### `PropertyValue`

```idl
typedef any PropertyValue
```

Property values should reflect the data type determined by their property name.
For example,
the HTML `<div hidden></div>` has a `hidden` attribute,
which is reflected as a `hidden` property name set to the property value `true`,
and `<input minlength="5">`,
which has a `minlength` attribute,
is reflected as a `minLength` property name set to the property value `5`.

> In [JSON][ietf-json],
> the value `null` must be treated as if the property was not included.
> In [JavaScript][ecma-javascript],
> both `null` and `undefined` must be similarly ignored.

The DOM has strict rules on how it coerces HTML to expected values,
whereas hast is more lenient in how it reflects the source.
Where the DOM treats `<div hidden="no"></div>` as having a value of `true` and
`<img width="yes">` as having a value of `0`,
these should be reflected as `'no'` and `'yes'`,
respectively,
in hast.

> The reason for this is to allow plugins and utilities to inspect these
> non-standard values.

The DOM also specifies comma separated and space separated lists attribute
values.
In hast, these should be treated as ordered lists.
For example,
`<div class="alpha bravo"></div>` is represented as `['alpha', 'bravo']`.

> There’s no special format for the property value of the `style` property name.

## Glossary

See [§ *Glossary* in `syntax-tree/unist`][github-unist-glossary].

## List of utilities

See [§ *List of utilities* in `syntax-tree/unist`][github-unist-utilities]
for more utilities.

<!--lint disable media-style-->

<!--
Utilities.
The first is special.
The rest is sorted alphabetically based on content after `hast-util-`
-->

* [`hastscript`](https://github.com/syntax-tree/hastscript)
  — create trees
* [`hast-util-assert`](https://github.com/syntax-tree/hast-util-assert)
  — assert nodes
* [`hast-util-class-list`](https://github.com/shredsnews/hast-util-class-list)
  — simulate the browser’s `classList` API for hast nodes
* [`hast-util-classnames`](https://github.com/syntax-tree/hast-util-classnames)
  — merge class names together
* [`hast-util-embedded`](https://github.com/syntax-tree/hast-util-embedded)
  — check if a node is an embedded element
* [`hast-util-excerpt`](https://github.com/syntax-tree/hast-util-excerpt)
  — truncate the tree to a comment
* [`hast-util-find-and-replace`](https://github.com/syntax-tree/hast-util-find-and-replace)
  — find and replace text in a tree
* [`hast-util-format`](https://github.com/syntax-tree/hast-util-format)
  — format whitespace
* [`hast-util-from-dom`](https://github.com/syntax-tree/hast-util-from-dom)
  — transform from DOM tree
* [`hast-util-from-html`](https://github.com/syntax-tree/hast-util-from-html)
  — parse from HTML
* [`hast-util-from-parse5`](https://github.com/syntax-tree/hast-util-from-parse5)
  — transform from Parse5’s AST
* [`hast-util-from-selector`](https://github.com/syntax-tree/hast-util-from-selector)
  — parse CSS selectors to nodes
* [`hast-util-from-string`](https://github.com/rehypejs/rehype-minify/tree/main/packages/hast-util-from-string)
  — set the plain-text value of a node (`textContent`)
* [`hast-util-from-text`](https://github.com/syntax-tree/hast-util-from-text)
  — set the plain-text value of a node (`innerText`)
* [`hast-util-from-webparser`](https://github.com/Prettyhtml/prettyhtml/tree/HEAD/packages/hast-util-from-webparser)
  — transform Webparser’s AST to hast
* [`hast-util-has-property`](https://github.com/syntax-tree/hast-util-has-property)
  — check if an element has a certain property
* [`hast-util-heading`](https://github.com/syntax-tree/hast-util-heading)
  — check if a node is heading content
* [`hast-util-heading-rank`](https://github.com/syntax-tree/hast-util-heading-rank)
  — get the rank (also known as depth or level) of headings
* [`hast-util-interactive`](https://github.com/syntax-tree/hast-util-interactive)
  — check if a node is interactive
* [`hast-util-is-body-ok-link`](https://github.com/rehypejs/rehype-minify/tree/main/packages/hast-util-is-body-ok-link)
  — check if a `link` element is “Body OK”
* [`hast-util-is-conditional-comment`](https://github.com/rehypejs/rehype-minify/tree/HEAD/packages/hast-util-is-conditional-comment)
  — check if `node` is a conditional comment
* [`hast-util-is-css-link`](https://github.com/rehypejs/rehype-minify/tree/main/packages/hast-util-is-css-link)
  — check if `node` is a CSS `link`
* [`hast-util-is-css-style`](https://github.com/rehypejs/rehype-minify/tree/main/packages/hast-util-is-css-style)
  — check if `node` is a CSS `style`
* [`hast-util-is-element`](https://github.com/syntax-tree/hast-util-is-element)
  — check if `node` is a (certain) element
* [`hast-util-is-event-handler`](https://github.com/rehypejs/rehype-minify/tree/main/packages/hast-util-is-event-handler)
  — check if `property` is an event handler
* [`hast-util-is-javascript`](https://github.com/rehypejs/rehype-minify/tree/main/packages/hast-util-is-javascript)
  — check if `node` is a JavaScript `script`
* [`hast-util-labelable`](https://github.com/syntax-tree/hast-util-labelable)
  — check if `node` is labelable
* [`hast-util-minify-whitespace`](https://github.com/rehypejs/rehype-minify/tree/main/packages/hast-util-minify-whitespace)
  — minify whitespace between elements
* [`hast-util-parse-selector`](https://github.com/syntax-tree/hast-util-parse-selector)
  — create an element from a simple CSS selector
* [`hast-util-phrasing`](https://github.com/syntax-tree/hast-util-phrasing)
  — check if a node is phrasing content
* [`hast-util-raw`](https://github.com/syntax-tree/hast-util-raw)
  — parse a tree again
* [`hast-util-reading-time`](https://github.com/syntax-tree/hast-util-reading-time)
  — estimate the reading time
* [`hast-util-sanitize`](https://github.com/syntax-tree/hast-util-sanitize)
  — sanitize nodes
* [`hast-util-script-supporting`](https://github.com/syntax-tree/hast-util-script-supporting)
  — check if `node` is script-supporting content
* [`hast-util-select`](https://github.com/syntax-tree/hast-util-select)
  — `querySelector`, `querySelectorAll`, and `matches`
* [`hast-util-sectioning`](https://github.com/syntax-tree/hast-util-sectioning)
  — check if `node` is sectioning content
* [`hast-util-shift-heading`](https://github.com/syntax-tree/hast-util-shift-heading)
  — change heading rank (depth, level)
* [`hast-util-table-cell-style`](https://github.com/mapbox/hast-util-table-cell-style)
  — transform deprecated styling attributes on table cells to inline styles
* [`hast-util-to-dom`](https://github.com/syntax-tree/hast-util-to-dom)
  — transform to a DOM tree
* [`hast-util-to-estree`](https://github.com/syntax-tree/hast-util-to-estree)
  — transform to estree (JavaScript AST) JSX
* [`hast-util-to-html`](https://github.com/syntax-tree/hast-util-to-html)
  — serialize as HTML
* [`hast-util-to-jsx`](https://github.com/mapbox/jsxtreme-markdown/tree/HEAD/packages/hast-util-to-jsx)
  — transform hast to JSX
* [`hast-util-to-jsx-runtime`](https://github.com/syntax-tree/hast-util-to-jsx-runtime)
  — transform to preact, react, solid, svelte, vue, etc
* [`hast-util-to-mdast`](https://github.com/syntax-tree/hast-util-to-mdast)
  — transform to mdast (markdown)
* [`hast-util-to-nlcst`](https://github.com/syntax-tree/hast-util-to-nlcst)
  — transform to nlcst (natural language)
* [`hast-util-to-parse5`](https://github.com/syntax-tree/hast-util-to-parse5)
  — transform to Parse5’s AST
* [`hast-util-to-portable-text`](https://github.com/rexxars/hast-util-to-portable-text)
  — transform to portable text
* [`hast-util-to-string`](https://github.com/rehypejs/rehype-minify/tree/HEAD/packages/hast-util-to-string)
  — get the plain-text value of a node (`textContent`)
* [`hast-util-to-text`](https://github.com/syntax-tree/hast-util-to-text)
  — get the plain-text value of a node (`innerText`)
* [`hast-util-to-xast`](https://github.com/syntax-tree/hast-util-to-xast)
  — transform to xast (xml)
* [`hast-util-transparent`](https://github.com/syntax-tree/hast-util-transparent)
  — check if `node` is transparent content
* [`hast-util-truncate`](https://github.com/syntax-tree/hast-util-truncate)
  — truncate the tree to a certain number of characters
* [`hast-util-whitespace`](https://github.com/syntax-tree/hast-util-whitespace)
  — check if `node` is inter-element whitespace

## Related HTML utilities

* [`a-rel`](https://github.com/wooorm/a-rel)
  — List of link types for `rel` on `a` / `area`
* [`aria-attributes`](https://github.com/wooorm/aria-attributes)
  — List of ARIA attributes
* [`collapse-white-space`](https://github.com/wooorm/collapse-white-space)
  — Replace multiple white-space characters with a single space
* [`comma-separated-tokens`](https://github.com/wooorm/comma-separated-tokens)
  — Parse/stringify comma separated tokens
* [`html-tag-names`](https://github.com/wooorm/html-tag-names)
  — List of HTML tag names
* [`html-dangerous-encodings`](https://github.com/wooorm/html-dangerous-encodings)
  — List of dangerous HTML character encoding labels
* [`html-encodings`](https://github.com/wooorm/html-encodings)
  — List of HTML character encoding labels
* [`html-element-attributes`](https://github.com/wooorm/html-element-attributes)
  — Map of HTML attributes
* [`html-event-attributes`](https://github.com/wooorm/html-event-attributes)
  — List of HTML event handler content attributes
* [`html-void-elements`](https://github.com/wooorm/html-void-elements)
  — List of void HTML tag names
* [`link-rel`](https://github.com/wooorm/link-rel)
  — List of link types for `rel` on `link`
* [`mathml-tag-names`](https://github.com/wooorm/mathml-tag-names)
  — List of MathML tag names
* [`meta-name`](https://github.com/wooorm/meta-name)
  — List of values for `name` on `meta`
* [`property-information`](https://github.com/wooorm/property-information)
  — Information on HTML properties
* [`space-separated-tokens`](https://github.com/wooorm/space-separated-tokens)
  — Parse/stringify space separated tokens
* [`svg-tag-names`](https://github.com/wooorm/svg-tag-names)
  — List of SVG tag names
* [`svg-element-attributes`](https://github.com/wooorm/svg-element-attributes)
  — Map of SVG attributes
* [`svg-event-attributes`](https://github.com/wooorm/svg-event-attributes)
  — List of SVG event handler content attributes
* [`web-namespaces`](https://github.com/wooorm/web-namespaces)
  — Map of web namespaces

<!--lint enable media-style-->

## References

* **unist**:
  [Universal Syntax Tree][github-unist].
  T. Wormer; et al.
* **JavaScript**:
  [ECMAScript Language Specification][ecma-javascript].
  Ecma International.
* **HTML**:
  [HTML Standard][whatwg-html],
  A. van Kesteren; et al.
  WHATWG.
* **DOM**:
  [DOM Standard][whatwg-dom],
  A. van Kesteren,
  A. Gregor,
  Ms2ger.
  WHATWG.
* **SVG**:
  [Scalable Vector Graphics (SVG)][w3c-svg],
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
* **MathML**:
  [Mathematical Markup Language Standard][w3c-mathml],
  D. Carlisle,
  P. Ion,
  R. Miner.
  W3C.
* **ARIA**:
  [Accessible Rich Internet Applications (WAI-ARIA)][w3c-aria],
  J. Diggs,
  J. Craig,
  S. McCarron,
  M. Cooper.
  W3C.
* **JSON**
  [The JavaScript Object Notation (JSON) Data Interchange Format][ietf-json],
  T. Bray.
  IETF.
* **Web IDL**:
  [Web IDL][whatwg-webidl],
  C. McCormack.
  W3C.

## Security

As hast represents HTML,
and improper use of HTML can open you up to a
[cross-site scripting (XSS)][wikipedia-xss] attack,
improper use of hast is also unsafe.
Always be careful with user input and use
[`hast-util-santize`][github-hast-util-sanitize] to make the hast tree safe.

## Related

* [mdast](https://github.com/syntax-tree/mdast)
  — Markdown Abstract Syntax Tree format
* [nlcst](https://github.com/syntax-tree/nlcst)
  — Natural Language Concrete Syntax Tree format
* [xast](https://github.com/syntax-tree/xast)
  — Extensible Abstract Syntax Tree

## Contribute

See [`contributing.md`][health-contributing] in
[`syntax-tree/.github`][health] for ways to get started.
See [`support.md`][health-support] for ways to get help.

A curated list of awesome syntax-tree,
unist,
mdast,
hast,
xast,
and nlcst resources can be found in
[awesome syntax-tree][github-syntax-tree-awesome].

This project has a [code of conduct][health-coc].
By interacting with this repository,
organization,
or community you agree to abide by its terms.

## Acknowledgments

The initial release of this project was authored by
[**@wooorm**](https://github.com/wooorm).

Special thanks to [**@eush77**](https://github.com/eush77) for their work,
ideas,
and incredibly valuable feedback!

Thanks to
[**@andrewburgess**](https://github.com/andrewburgess),
[**@arobase-che**](https://github.com/arobase-che),
[**@arystan-sw**](https://github.com/arystan-sw),
[**@BarryThePenguin**](https://github.com/BarryThePenguin),
[**@brechtcs**](https://github.com/brechtcs),
[**@ChristianMurphy**](https://github.com/ChristianMurphy),
[**@ChristopherBiscardi**](https://github.com/ChristopherBiscardi),
[**@craftzdog**](https://github.com/craftzdog),
[**@cupojoe**](https://github.com/cupojoe),
[**@davidtheclark**](https://github.com/davidtheclark),
[**@derhuerst**](https://github.com/derhuerst),
[**@detj**](https://github.com/detj),
[**@DxCx**](https://github.com/DxCx),
[**@erquhart**](https://github.com/erquhart),
[**@flurmbo**](https://github.com/flurmbo),
[**@Hamms**](https://github.com/Hamms),
[**@Hypercubed**](https://github.com/Hypercubed),
[**@inklesspen**](https://github.com/inklesspen),
[**@jeffal**](https://github.com/jeffal),
[**@jlevy**](https://github.com/jlevy),
[**@Justineo**](https://github.com/Justineo),
[**@lfittl**](https://github.com/lfittl),
[**@kgryte**](https://github.com/kgryte),
[**@kmck**](https://github.com/kmck),
[**@kthjm**](https://github.com/kthjm),
[**@KyleAMathews**](https://github.com/KyleAMathews),
[**@macklinu**](https://github.com/macklinu),
[**@medfreeman**](https://github.com/medfreeman),
[**@Murderlon**](https://github.com/Murderlon),
[**@nevik**](https://github.com/nevik),
[**@nokome**](https://github.com/nokome),
[**@phiresky**](https://github.com/phiresky),
[**@revolunet**](https://github.com/revolunet),
[**@rhysd**](https://github.com/rhysd),
[**@Rokt33r**](https://github.com/Rokt33r),
[**@rubys**](https://github.com/rubys),
[**@s1n**](https://github.com/s1n),
[**@Sarah-Seo**](https://github.com/Sarah-Seo),
[**@sethvincent**](https://github.com/sethvincent),
[**@simov**](https://github.com/simov),
[**@StarpTech**](https://github.com/StarpTech),
[**@stefanprobst**](https://github.com/stefanprobst),
[**@stuff**](https://github.com/stuff),
[**@subhero24**](https://github.com/subhero24),
[**@tripodsan**](https://github.com/tripodsan),
[**@tunnckoCore**](https://github.com/tunnckoCore),
[**@vhf**](https://github.com/vhf),
[**@voischev**](https://github.com/voischev), and
[**@zjaml**](https://github.com/zjaml),
for contributing to hast and related projects!

## License

[CC-BY-4.0][creativecommons-by-4] © [Titus Wormer][wooorm]

<!-- Definitions -->

[concept-aria-reflection]: https://w3c.github.io/aria/#idl_attr_disambiguation

[concept-comment]: https://dom.spec.whatwg.org/#interface-comment

[concept-documenttype]: https://dom.spec.whatwg.org/#documenttype

[concept-element]: https://dom.spec.whatwg.org/#interface-element

[concept-local-name]: https://dom.spec.whatwg.org/#concept-element-local-name

[concept-scripting]: https://html.spec.whatwg.org/multipage/webappapis.html#enabling-and-disabling-scripting

[concept-text]: https://dom.spec.whatwg.org/#interface-text

[creativecommons-by-4]: https://creativecommons.org/licenses/by/4.0/

[dfn-element]: #element

[dfn-literal]: #literal

[dfn-parent]: #parent

[dfn-properties]: #properties

[dfn-property-name]: #propertyname

[dfn-property-value]: #propertyvalue

[dfn-root]: #root

[dfn-unist-literal]: https://github.com/syntax-tree/unist#literal

[dfn-unist-node]: https://github.com/syntax-tree/unist#node

[dfn-unist-parent]: https://github.com/syntax-tree/unist#parent

[ecma-javascript]: https://www.ecma-international.org/ecma-262/9.0/index.html

[github-hast-logo]: https://raw.githubusercontent.com/syntax-tree/hast/6a36689/logo.svg?sanitize=true

[github-hast-release]: https://github.com/syntax-tree/hast/releases/tag/2.4.0

[github-hast-releases]: https://github.com/syntax-tree/hast/releases

[github-hast-util-sanitize]: https://github.com/syntax-tree/hast-util-sanitize

[github-hastscript]: https://github.com/syntax-tree/hastscript

[github-property-information]: https://github.com/wooorm/property-information

[github-rehype]: https://github.com/rehypejs/rehype

[github-syntax-tree-awesome]: https://github.com/syntax-tree/awesome-syntax-tree

[github-unified]: https://github.com/unifiedjs/unified

[github-unist]: https://github.com/syntax-tree/unist

[github-unist-glossary]: https://github.com/syntax-tree/unist#glossary

[github-unist-syntax-tree]: https://github.com/syntax-tree/unist#syntax-tree

[github-unist-utilities]: https://github.com/syntax-tree/unist#list-of-utilities

[health]: https://github.com/syntax-tree/.github

[health-coc]: https://github.com/syntax-tree/.github/blob/HEAD/code-of-conduct.md

[health-contributing]: https://github.com/syntax-tree/.github/blob/HEAD/contributing.md

[health-support]: https://github.com/syntax-tree/.github/blob/HEAD/support.md

[ietf-json]: https://datatracker.ietf.org/doc/html/rfc7159

[section-utilities]: #list-of-utilities

[term-child]: https://github.com/syntax-tree/unist#child

[term-leaf]: https://github.com/syntax-tree/unist#leaf

[term-root]: https://github.com/syntax-tree/unist#root

[term-tree]: https://github.com/syntax-tree/unist#tree

[w3c-aria]: https://www.w3.org/TR/wai-aria-1.3/

[w3c-mathml]: https://www.w3.org/TR/mathml4/

[w3c-svg]: https://www.w3.org/TR/SVG2/

[whatwg-dom]: https://dom.spec.whatwg.org/

[whatwg-html]: https://html.spec.whatwg.org/multipage/

[whatwg-webidl]: https://webidl.spec.whatwg.org

[wikipedia-xss]: https://en.wikipedia.org/wiki/Cross-site_scripting

[wooorm]: https://wooorm.com
