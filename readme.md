# ![hast](https://cdn.rawgit.com/wooorm/hast/master/logo.svg)

**hast** is an HTML processor powered by plugins. Lots of bla. Bla and Bla.
100% coverbla.

> **hast is not (yet) fit for human consumption**.

Just like what [**retext**](https://github.com/wooorm/retext) did for natural
language and [**mdast**](https://github.com/wooorm/mdast) for markdown, now
comes HTML.

## Installation

[npm](https://docs.npmjs.com/cli/install):

```bash
npm install wooorm/hast
```

## API

### [hast](#api).process(value, done?)

Parse an HTML document, apply plugins to it, and compile it.

**Signatures**

*   `doc = hast().process(value, options?, done?)`.

*   `done` (`function(Error?, File?, string?)`) — Callback invoked when the
    is generated with either an error, or a result. Only strictly needed when
    async plugins are used.

**Returns**

`string` or `null`: A document. The result is `null` if a plugin is
asynchronous, in which case the callback `done` should’ve been passed (don’t
worry: plugin creators make sure you know it’s async).

### [hast](#api).use(plugin, options?)

Change the way [`hast`](#api) works by using a `plugin`.

**Signatures**

*   `processor = hast.use(plugin, options?)`;
*   `processor = hast.use(plugins)`.

**Parameters**

*   `plugin` (`Function`) — A **Plugin**;
*   `plugins` (`Array.<Function>`) — A list of **Plugin**s;
*   `options` (`Object?`) — Passed to plugin. Specified by its documentation.

**Returns**

`Object`: an instance of HAST: The returned object functions just like
**hast**, but caches the `use`d plugins. This provides the ability to chain
`use` calls to use multiple plugins, but ensures the functioning of the
**hast** module does not change for other dependents.

## Nodes

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

## License

[MIT](LICENSE) © [Titus Wormer](http://wooorm.com)
