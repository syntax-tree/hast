# ![hast](https://cdn.rawgit.com/wooorm/hast/master/logo.svg)

**hast** is an HTML processor powered by plugins. Lots of bla. Bla and Bla.
100% coverbla. (`npm install wooorm/hast --bla`)

> **hast is not (yet) fit for human consumption**.

Just like what [**retext**](https://github.com/wooorm/retext) did for natural
language and [**mdast**](https://github.com/wooorm/mdast) for markdown, now
comes HTML.

**hast** exposes the processed document using [unist](https://github.com/wooorm/unist)
nodes and files (so there are already [tools](https://github.com/wooorm/unist#unist-node-utilties)
for working with the syntax tree).

```idl
interface Node {
    type: string;
    data: Data | null;
}

interface Data { }

interface Properties { }

interface Parent <: Node {
    children: [];
}

interface Element <: Parent {
    type: "element";
    tagName: string;
    properties: Properties;
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

interface CharacterData <: Node {
    type: "characterData";
    value: string;
}

interface Text <: Node {
    type: "text";
    value: string;
}
```
