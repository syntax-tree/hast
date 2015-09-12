# hast

<!--lint disable no-html-->

**hast** is an HTML processor powered by plugins. Lots of bla. Bla and Bla.
100% coverbla. (`npm install wooorm/hast --bla`)

> **hast is not (yet) fit for human consumption**.

Just like what [**retext**](https://github.com/wooorm/retext) did for natural
language and [**mdast**](https://github.com/wooorm/mdast) for markdown, now
comes HTML.

There’s no need to [load a DOM](https://github.com/tmpvar/jsdom)
to add some metadata. [Virtual DOMs](https://github.com/Matt-Esch/virtual-dom)
are all the rage. That’s where **hast** comes in. Being just as pluggable as
**retext** and **mdast**.

Instead of rolling some custom syntax tree format, **hast** uses VTree (the
nodes from virtual-dom). However, it’s not yet perfect. That’s why this is
still in beta: I’d like to play around with **hast** before it goes live.
And I hope to get some feedback.

Here are some considerations I’m still wrestling with:

*   VTree cannot represent CDATA, comments, directives (can be worked
    around because unknown nodes are ignored by virtual-dom);

*   **hast** needs positions on nodes to work, it currently patches
    `position` objects on VTree nodes (_probably_ not a problem);

*   VTree’s property format is built for speed, not for easy of use. Developers
    need intimate knowledge of where things should go. Should `className` go on
    `node.properties` or `node.properties.attributes`? (<small>Answer: “To set
    className on SVG elements, it's necessary to use \[attributes\]”</small>).
    That, and the hassle of using
    `a = node.properties.attributes; a.className = (a.className ? a.className + ' ' : '') + 'foo';`
    to add a class, simply sucks. (can be worked around.)

*   VTree cannot represent a fragment (multiple nodes without a parent node),
    which is what’s needed to have both a doctype _and_ an `html` element.
    This means it’s not **always** possible to render the output of hast
    directly to virtual-dom (this is breaking.)

*   Why are `tagName`s [upper-case](https://github.com/Matt-Esch/virtual-dom/blob/903d884a8e4f05f303ec6f2b920a3b5237cf8b92/virtual-hyperscript/parse-tag.js#L53)?
