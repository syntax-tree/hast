# hast

<!--lint disable no-html-->

**hast** is an HTML processor powered by plugins. Lots of bla. Bla and Bla.
100% coverbla. (`npm install wooorm/hast --bla`)

> **hast is not (yet) fit for human consumption**.

Just like what [**retext**](https://github.com/wooorm/retext) did for natural
language and [**mdast**](https://github.com/wooorm/mdast) for markdown, now
comes HTML.

**hast** exposes the processed document using [unist](https://github.com/wooorm/unist)
nodes and files (so there are already [tools](https://github.com/wooorm/unist#unist-node-utilties)
for working with the syntax tree).

The things not yet figured out is how to handle properties on elements: for
example, I’d like `node.properties.style` to be an `object?` with camelCase
properties, to make it easy to manipulate styles.

Something similar is `node.properties.className` (or `node.properties.class`?),
which should be `Array.<string>?`.

And what about `aria` properties? Could those be an object too? `node.properties.aria.label` would make things a lot easier.

The current version’s `properties` adheres to
[VProperties](https://github.com/Matt-Esch/virtual-dom/blob/903d884/docs.jsig#L37),
which is slightly developer-unfriendly.

```idl
interface Node {
    type: string;
    data: Data | null;
}

interface Data { }

interface Parent <: Node {
    children: [];
}

interface Element <: Parent {
    type: "element";
    tagName: string;
    properties: VProperties;
    children: [];
}

interface Root <: Parent {
    type: "root";
}

interface Directive <: Node {
    type: "directive";
    value: string;
}

interface Comment <: Node {
    type: "comment";
    value: string;
}

interface CData <: Node {
    type: "cdata";
    value: string;
}

interface Text <: Node {
    type: "text";
    value: string;
}
```
