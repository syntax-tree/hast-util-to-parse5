/**
 * @typedef {import('parse5').DefaultTreeAdapterMap} DefaultTreeAdapterMap
 * @typedef {DefaultTreeAdapterMap['document']} P5Document
 * @typedef {DefaultTreeAdapterMap['documentFragment']} P5Fragment
 * @typedef {DefaultTreeAdapterMap['element']} P5Element
 * @typedef {DefaultTreeAdapterMap['node']} P5Node
 * @typedef {DefaultTreeAdapterMap['documentType']} P5Doctype
 * @typedef {DefaultTreeAdapterMap['commentNode']} P5Comment
 * @typedef {DefaultTreeAdapterMap['textNode']} P5Text
 * @typedef {DefaultTreeAdapterMap['parentNode']} P5Parent
 * @typedef {import('parse5/dist/common/token.js').Attribute} P5Attribute
 * @typedef {Exclude<P5Node, P5Document|P5Fragment>} P5Child
 * @typedef {import('property-information').Schema} Schema
 * @typedef {import('property-information').Info} Info
 * @typedef {'html'|'svg'} Space
 * @typedef {import('hast').Parent} Parent
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast').DocType} Doctype
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').Text} Text
 * @typedef {import('hast').Comment} Comment
 * @typedef {Parent['children'][number]} Child
 * @typedef {Child|Root} Node
 *
 * @callback Handle
 * @param {Node} node
 * @param {Schema} schema
 * @returns {P5Node}
 */

import {html, svg, find} from 'property-information'
import {toH} from 'hast-to-hyperscript'
import {webNamespaces} from 'web-namespaces'
import {zwitch} from 'zwitch'

const ns = /** @type {Record<string, string>} */ (webNamespaces)

const own = {}.hasOwnProperty

// @ts-expect-error: hush.
const one = zwitch('type', {handlers: {root, element, text, comment, doctype}})

/**
 * Transform a tree from hast to Parse5’s AST.
 *
 * @param {Node} tree
 * @param {Space} [space='html']
 * @returns {P5Node}
 */
export function toParse5(tree, space) {
  // @ts-expect-error Types are wrong.
  return one(tree, space === 'svg' ? svg : html)
}

/**
 * @type {Handle}
 * @param {Root} node
 * @returns {P5Document}
 */
function root(node, schema) {
  /** @type {P5Document} */
  const p5 = {
    // @ts-expect-error: fine.
    nodeName: '#document',
    // @ts-expect-error: fine.
    mode: (node.data || {}).quirksMode ? 'quirks' : 'no-quirks',
    childNodes: []
  }
  p5.childNodes = all(node.children, p5, schema)
  return patch(node, p5)
}

/**
 * @type {Handle}
 * @param {Root} node
 * @returns {P5Fragment}
 */
function fragment(node, schema) {
  /** @type {P5Fragment} */
  const p5 = {
    // @ts-expect-error: fine.
    nodeName: '#document-fragment',
    childNodes: []
  }
  p5.childNodes = all(node.children, p5, schema)
  return patch(node, p5)
}

/**
 * @type {Handle}
 * @param {Doctype} node
 * @returns {P5Doctype}
 */
function doctype(node) {
  // @ts-expect-error: fine.
  return patch(node, {
    nodeName: '#documentType',
    name: 'html',
    publicId: '',
    systemId: '',
    // @ts-expect-error: change to `null` in a major?
    parentNode: undefined
  })
}

/**
 * @type {Handle}
 * @param {Text} node
 * @returns {P5Text}
 */
function text(node) {
  return patch(
    node,
    // @ts-expect-error: no `parentNode`
    /** @type {P5Text} */ ({
      nodeName: '#text',
      value: node.value,
      parentNode: undefined
    })
  )
}

/**
 * @type {Handle}
 * @param {Comment} node
 * @returns {P5Comment}
 */
function comment(node) {
  return patch(
    node,
    // @ts-expect-error: no `parentNode`
    /** @type {P5Comment} */ ({
      nodeName: '#comment',
      data: node.value,
      parentNode: undefined
    })
  )
}

/**
 * @type {Handle}
 * @param {Element} node
 * @returns {P5Element}
 */
function element(node, schema) {
  /** @type {Space} */
  // @ts-expect-error Assume space.
  const space = schema.space
  return toH(h, Object.assign({}, node, {children: []}), {space})

  /**
   * @param {string} name
   * @param {Record<string, string|boolean|number>} attrs
   */
  function h(name, attrs) {
    /** @type {Array<P5Attribute>} */
    const values = []
    /** @type {string} */
    let key

    for (key in attrs) {
      if (!own.call(attrs, key) || attrs[key] === false) {
        continue
      }

      const info = find(schema, key)

      if (info.boolean && !attrs[key]) {
        continue
      }

      /** @type {P5Attribute} */
      const value = {
        name: key,
        value: attrs[key] === true ? '' : String(attrs[key])
      }

      if (info.space && info.space !== 'html' && info.space !== 'svg') {
        const index = key.indexOf(':')

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

    if (schema.space === 'html' && node.tagName === 'svg') schema = svg

    /** @type {P5Element} */
    const p5 = patch(
      node,
      // @ts-expect-error: no `parentNode`
      /** @type {P5Element} */ ({
        nodeName: name,
        tagName: name,
        attrs: values,
        // @ts-expect-error: html and svg both have a space.
        namespaceURI: ns[schema.space],
        childNodes: [],
        parentNode: undefined
      })
    )

    p5.childNodes = all(node.children, p5, schema)

    // @ts-expect-error Types are wrong.
    if (name === 'template') p5.content = fragment(node.content, schema)

    return p5
  }
}

/**
 * @param {Array<Child>} children
 * @param {P5Parent} p5
 * @param {Schema} schema
 * @returns {Array<P5Child>}
 */
function all(children, p5, schema) {
  let index = -1
  /** @type {Array<P5Child>} */
  const result = []

  if (children) {
    while (++index < children.length) {
      /** @type {P5Child} */
      // @ts-expect-error Assume child.
      const child = one(children[index], schema)

      child.parentNode = p5

      result.push(child)
    }
  }

  return result
}

/**
 * Patch specific properties.
 *
 * @template {P5Node} T
 * @param {Node} node
 * @param {T} p5
 * @returns {T}
 */
function patch(node, p5) {
  const position = node.position

  if (position && position.start && position.end) {
    p5.sourceCodeLocation = {
      startLine: position.start.line,
      startCol: position.start.column,
      // @ts-expect-error assume this is set.
      startOffset: position.start.offset,
      endLine: position.end.line,
      endCol: position.end.column,
      // @ts-expect-error assume this is set.
      endOffset: position.end.offset
    }
  }

  return p5
}
