/* eslint-env commonjs */
function visit(tree, type, callback) {
    if (!callback) {
        callback = type;
        type = null;
    }

    function one(node, position, parent) {
        var index = -1;
        var children = node.children;
        var length = children && children.length;

        if (!type || node.tagName === type) {
            callback(node, position, parent);
        }

        while (++index < length) {
            one(children[index], index, node);
        }
    }

    return one(tree);
}

module.exports = visit;
