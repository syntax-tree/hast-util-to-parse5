'use strict';

/* Dependencies. */
var xtend = require('xtend');
var toH = require('hast-to-hyperscript');
var NS = require('web-namespaces');
var has = require('has');
var zwitch = require('zwitch');
var mapz = require('mapz');

/* Expose. */
module.exports = transform;

/* Construct. */
var one = zwitch('type');
var all = mapz(one, {key: 'children', indices: false});

one.handlers.root = root;
one.handlers.element = element;
one.handlers.text = text;
one.handlers.comment = comment;
one.handlers.doctype = doctype;

/* Map of tag-names starting new namespaces. */
var namespaces = {
  math: NS.mathml,
  svg: NS.svg
};

/* Map of attributes with namespaces. */
var attributeSpaces = {
  'xlink:actuate': {prefix: 'xlink', name: 'actuate', namespace: NS.xlink},
  'xlink:arcrole': {prefix: 'xlink', name: 'arcrole', namespace: NS.xlink},
  'xlink:href': {prefix: 'xlink', name: 'href', namespace: NS.xlink},
  'xlink:role': {prefix: 'xlink', name: 'role', namespace: NS.xlink},
  'xlink:show': {prefix: 'xlink', name: 'show', namespace: NS.xlink},
  'xlink:title': {prefix: 'xlink', name: 'title', namespace: NS.xlink},
  'xlink:type': {prefix: 'xlink', name: 'type', namespace: NS.xlink},
  'xml:base': {prefix: 'xml', name: 'base', namespace: NS.xml},
  'xml:lang': {prefix: 'xml', name: 'lang', namespace: NS.xml},
  'xml:space': {prefix: 'xml', name: 'space', namespace: NS.xml},
  xmlns: {prefix: '', name: 'xmlns', namespace: NS.xmlns},
  'xmlns:xlink': {prefix: 'xmlns', name: 'xlink', namespace: NS.xmlns}
};

/**
 * Transform a tree from HAST to Parse5’s AST.
 *
 * @param {HASTNode} tree - HAST tree.
 * @return {ASTNode} - Parse5 tree.
 */
function transform(tree) {
  return patch(one(tree), null, NS.html);
}

/**
 * Transform a root from HAST to Parse5.
 *
 * @param {HASTRoot} node - HAST root.
 * @return {ASTNode.<Document>} - Parse5 document.
 */
function root(node) {
  var data = node.data || {};
  var qs = has(data, 'quirksMode') ? Boolean(data.quirksMode) : false;

  return {
    nodeName: '#document',
    mode: qs ? 'quirks' : 'no-quirks',
    childNodes: all(node)
  };
}

/**
 * Transform an element from HAST to Parse5.
 *
 * @param {HASTElement} node - HAST element.
 * @return {ASTNode.<Element>} - Parse5 element.
 */
function element(node) {
  var shallow = xtend(node);

  shallow.children = [];

  return toH(function (name, attrs) {
    var values = [];
    var key;

    for (key in attrs) {
      if (has(attributeSpaces, key)) {
        values.push(xtend({
          name: key,
          value: attrs[key]
        }, attributeSpaces[key]));
      } else {
        values.push({
          name: key,
          value: attrs[key]
        });
      }
    }

    return wrap(node, {
      nodeName: node.tagName,
      tagName: node.tagName,
      attrs: values,
      childNodes: node.children ? all(node) : []
    });
  }, shallow);
}

/**
 * Transform a doctype from HAST to Parse5.
 *
 * @param {HASTDoctype} node - HAST doctype.
 * @return {ASTNode.<DocumentType>} - Parse5 doctype.
 */
function doctype(node) {
  return wrap(node, {
    nodeName: '#documentType',
    name: node.name,
    publicId: node.public || null,
    systemId: node.system || null
  });
}

/**
 * Transform a text from HAST to Parse5.
 *
 * @param {HASTText} node - HAST text.
 * @return {ASTNode.<Text>} - Parse5 text.
 */
function text(node) {
  return wrap(node, {
    nodeName: '#text',
    value: node.value
  });
}

/**
 * Transform a comment from HAST to Parse5.
 *
 * @param {HASTComment} node - HAST comment.
 * @return {ASTNode.<Comment>} - Parse5 comment.
 */
function comment(node) {
  return wrap(node, {
    nodeName: '#comment',
    data: node.value
  });
}

/**
 * Patch position.
 *
 * @param {HASTNode} node - HAST node.
 * @param {ASTNode} node - Parse5 node.
 * @return {ASTNode} - Given Parse5 node.
 */
function wrap(node, ast) {
  if (node.position && node.position.start && node.position.end) {
    ast.__location = {
      line: node.position.start.line,
      col: node.position.start.column,
      startOffset: node.position.start.offset,
      endOffset: node.position.end.offset
    };
  }

  return ast;
}

/**
 * Patch a tree recursively, by adding namespaces
 * and parent references where needed.
 *
 * @param {ASTNode} node - Parse5 node.
 * @param {ASTNode} parent - Parent of `node`.
 * @param {string} ns - Current namespace.
 * @return {ASTNode} - Patched replacement for `node`.
 */
function patch(node, parent, ns) {
  var location = node.__location;
  var children = node.childNodes;
  var name = node.tagName;
  var replacement = {};
  var length;
  var index;
  var key;

  for (key in node) {
    if (key !== '__location' && key !== 'childNodes') {
      replacement[key] = node[key];
    }
  }

  if (has(namespaces, name)) {
    ns = namespaces[name];
  }

  if (has(replacement, 'tagName')) {
    replacement.namespaceURI = ns;
  }

  if (children) {
    replacement.childNodes = children;
    length = children.length;
    index = -1;

    while (++index < length) {
      children[index] = patch(children[index], replacement, ns);
    }
  }

  if (parent) {
    replacement.parentNode = parent;
  }

  if (location) {
    replacement.__location = location;
  }

  return replacement;
}
