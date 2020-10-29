'use strict'

var xtend = require('xtend')
var html = require('property-information/html')
var svg = require('property-information/svg')
var find = require('property-information/find')
var toH = require('hast-to-hyperscript')
var ns = require('web-namespaces')
var zwitch = require('zwitch')

module.exports = toParse5

var one = zwitch('type', {
  handlers: {
    root: root,
    element: element,
    text: text,
    comment: comment,
    doctype: doctype
  }
})

// Transform a tree from hast to Parse5’s AST.
function toParse5(tree, space) {
  return one(tree, space === 'svg' ? svg : html)
}

function root(node, schema) {
  return patch(
    node,
    {
      nodeName: '#document',
      mode: (node.data || {}).quirksMode ? 'quirks' : 'no-quirks'
    },
    schema
  )
}

function fragment(node, schema) {
  return patch(node, {nodeName: '#document-fragment'}, schema)
}

function doctype(node, schema) {
  return patch(
    node,
    {
      nodeName: '#documentType',
      name: node.name,
      publicId: node.public || '',
      systemId: node.system || ''
    },
    schema
  )
}

function text(node, schema) {
  return patch(node, {nodeName: '#text', value: node.value}, schema)
}

function comment(node, schema) {
  return patch(node, {nodeName: '#comment', data: node.value}, schema)
}

function element(node, schema) {
  return toH(h, xtend(node, {children: []}), {space: schema.space})

  function h(name, attrs) {
    var values = []
    var info
    var value
    var key
    var index
    var p5

    for (key in attrs) {
      info = find(schema, key)

      if (attrs[key] === false || (info.boolean && !attrs[key])) {
        continue
      }

      value = {name: key, value: attrs[key] === true ? '' : String(attrs[key])}

      if (info.space && info.space !== 'html' && info.space !== 'svg') {
        index = key.indexOf(':')

        if (index < 0) {
          value.prefix = ''
        } else {
          value.name = key.slice(index + 1)
          value.prefix = key.slice(0, index)
        }

        value.namespace = ns[info.space]
      }

      values.push(value)
    }

    p5 = patch(node, {nodeName: name, tagName: name, attrs: values}, schema)

    if (name === 'template') p5.content = fragment(node.content, schema)

    return p5
  }
}

// Patch specific properties.
function patch(node, p5, parentSchema) {
  var schema = parentSchema
  var position = node.position
  var childNodes = []
  var index = -1
  var child

  if (node.type === 'element') {
    if (schema.space === 'html' && node.tagName === 'svg') schema = svg
    p5.namespaceURI = ns[schema.space]
  }

  if (node.type === 'element' || node.type === 'root') {
    p5.childNodes = childNodes

    if (node.children) {
      while (++index < node.children.length) {
        child = one(node.children[index], schema)
        child.parentNode = p5
        childNodes[index] = child
      }
    }
  }

  if (position && position.start && position.end) {
    p5.sourceCodeLocation = {
      startLine: position.start.line,
      startCol: position.start.column,
      startOffset: position.start.offset,
      endLine: position.end.line,
      endCol: position.end.column,
      endOffset: position.end.offset
    }
  }

  return p5
}
