import {html, svg, find} from 'property-information'
import {toH} from 'hast-to-hyperscript'
import {webNamespaces} from 'web-namespaces'
import {zwitch} from 'zwitch'

var own = {}.hasOwnProperty

var one = zwitch('type', {handlers: {root, element, text, comment, doctype}})

// Transform a tree from hast to Parse5’s AST.
export function toParse5(tree, space) {
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
  return toH(h, Object.assign({}, node, {children: []}), {space: schema.space})

  function h(name, attrs) {
    var values = []
    var info
    var value
    var key
    var index
    var p5

    for (key in attrs) {
      if (!own.call(attrs, key) || attrs[key] === false) {
        continue
      }

      info = find(schema, key)

      if (info.boolean && !attrs[key]) {
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

        value.namespace = webNamespaces[info.space]
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
    p5.namespaceURI = webNamespaces[schema.space]
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
