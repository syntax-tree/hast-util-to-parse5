import assert from 'node:assert/strict'
import test from 'node:test'
import stringify from 'json-stringify-safe'
import {parse, parseFragment} from 'parse5'
import {toParse5} from './index.js'

test('core', () => {
  assert.deepEqual(
    json(
      toParse5({
        type: 'root',
        children: [
          {type: 'doctype', name: 'html'},
          {
            type: 'element',
            tagName: 'html',
            children: [
              {type: 'element', tagName: 'head', children: []},
              {type: 'element', tagName: 'body', children: []}
            ]
          }
        ]
      })
    ),
    json(parse('<!doctypehtml>')),
    'should transform a root (no-quirks)'
  )
})

test('root', () => {
  assert.deepEqual(
    json(
      toParse5({
        type: 'root',
        data: {quirksMode: true},
        children: [
          {
            type: 'element',
            tagName: 'html',
            children: [
              {type: 'element', tagName: 'head', children: []},
              {type: 'element', tagName: 'body', children: []}
            ]
          }
        ]
      })
    ),
    json(parse('')),
    'should transform a root (quirks)'
  )

  assert.deepEqual(
    json(
      toParse5({
        type: 'root',
        children: [
          {type: 'doctype', name: 'html'},
          {
            type: 'element',
            tagName: 'html',
            children: [
              {type: 'element', tagName: 'head', children: []},
              {type: 'element', tagName: 'body', children: []}
            ]
          }
        ]
      })
    ),
    json(parse('<!doctypehtml>')),
    'should transform a root (no-quirks)'
  )
})

test('doctype', () => {
  const expected = parse('<!doctypehtml>').childNodes[0]
  // @ts-expect-error: p5 wants `null`.
  expected.parentNode = undefined

  assert.deepEqual(
    toParse5({type: 'doctype', name: 'html'}),
    expected,
    'should transform a doctype (modern)'
  )
})

test('text', () => {
  const expected = parseFragment('Alpha').childNodes[0]
  // @ts-expect-error: p5 wants `null`.
  expected.parentNode = undefined

  assert.deepEqual(
    toParse5({type: 'text', value: 'Alpha'}),
    expected,
    'should transform text'
  )
})

test('comment', () => {
  const expected = parseFragment('<!--Alpha-->').childNodes[0]
  // @ts-expect-error: p5 wants `null`.
  expected.parentNode = undefined

  assert.deepEqual(
    toParse5({type: 'comment', value: 'Alpha'}),
    expected,
    'should transform comments'
  )
})

test('element', () => {
  const expectedElements = parseFragment('<h1>Alpha').childNodes[0]
  // @ts-expect-error: p5 wants `null`.
  expectedElements.parentNode = undefined

  assert.deepEqual(
    json(
      toParse5({
        type: 'element',
        tagName: 'h1',
        children: [{type: 'text', value: 'Alpha'}]
      })
    ),
    json(expectedElements),
    'should transform elements'
  )

  const expectedAttributes = parseFragment(
    [
      '<div>',
      '<h1 id="a" class="b c" hidden height="2">',
      'alpha ',
      '<strong style="color:red;" foo="bar" camelCase="on off" data-123="456" data-some="yes" aria-valuenow="1">',
      'bravo',
      '</strong>',
      ' charlie',
      '</h1>',
      '<input checked type="file" accept=".jpg, .jpeg">',
      '</div>'
    ].join('')
  ).childNodes[0]
  // @ts-expect-error: p5 wants `null`.
  expectedAttributes.parentNode = undefined

  assert.deepEqual(
    json(
      toParse5({
        type: 'element',
        tagName: 'div',
        properties: {},
        children: [
          {
            type: 'element',
            tagName: 'h1',
            properties: {
              id: 'a',
              className: ['b', 'c'],
              hidden: true,
              height: 2
            },
            children: [
              {type: 'text', value: 'alpha '},
              {
                type: 'element',
                tagName: 'strong',
                properties: {
                  style: 'color:red;',
                  // Unknown booleans are ignored.
                  ignored: false,
                  // Falsey known booleans are ignored.
                  disabled: 0,
                  // Unknown props are left as-is.
                  foo: 'bar',
                  // Unknown lists are space-separated.
                  // Note: you’d expect `camelCase` here, but p5 lowercases
                  // attributes on HTML, so it drops the camelcase.
                  camelcase: ['on', 'off'],
                  // Numeric-start data properties.
                  data123: '456',
                  // Data properties.
                  dataSome: 'yes',
                  // ARIA props.
                  ariaValuenow: '1'
                },
                children: [{type: 'text', value: 'bravo'}]
              },
              {type: 'text', value: ' charlie'}
            ]
          },
          {
            type: 'element',
            tagName: 'input',
            properties: {
              checked: true,
              type: 'file',
              // Known comma-separated lists:
              accept: ['.jpg', '.jpeg']
            },
            children: []
          }
        ]
      })
    ),
    json(expectedAttributes)
  )

  const expectedVoid = parseFragment('<img src=# alt="">').childNodes[0]
  // @ts-expect-error: p5 wants `null`.
  expectedVoid.parentNode = undefined

  assert.deepEqual(
    json(
      toParse5({
        type: 'element',
        tagName: 'img',
        properties: {src: '#', alt: ''},
        children: []
      })
    ),
    json(expectedVoid),
    'should transform void elements'
  )

  const expectedTemplate = parseFragment('<template id="a">Alpha</template>')
    .childNodes[0]
  // @ts-expect-error: p5 wants `null`.
  expectedTemplate.parentNode = undefined

  assert.deepEqual(
    json(
      toParse5({
        type: 'element',
        tagName: 'template',
        properties: {id: 'a'},
        content: {
          type: 'root',
          children: [{type: 'text', value: 'Alpha'}]
        },
        children: []
      })
    ),
    json(expectedTemplate),
    'should transform templates with elements'
  )

  const expectedTemplateText = parseFragment(
    '<template id="b"><b>bold</b> and <i>italic</i></template>'
  ).childNodes[0]
  // @ts-expect-error: p5 wants `null`.
  expectedTemplateText.parentNode = undefined

  assert.deepEqual(
    json(
      toParse5({
        type: 'element',
        tagName: 'template',
        properties: {id: 'b'},
        content: {
          type: 'root',
          children: [
            {
              type: 'element',
              tagName: 'b',
              children: [{type: 'text', value: 'bold'}]
            },
            {type: 'text', value: ' and '},
            {
              type: 'element',
              tagName: 'i',
              children: [{type: 'text', value: 'italic'}]
            }
          ]
        },
        children: []
      })
    ),
    json(expectedTemplateText),
    'should transform templates with text'
  )
})

test('position', () => {
  const expected = parseFragment('<h1>Alpha', {
    sourceCodeLocationInfo: true
  }).childNodes[0]
  // @ts-expect-error: p5 wants `null`.
  expected.parentNode = undefined

  // @ts-expect-error Types are wrong.
  // Not possible yet to map this one.
  delete expected.sourceCodeLocation.startTag

  assert.deepEqual(
    json(
      toParse5({
        type: 'element',
        tagName: 'h1',
        children: [
          {
            type: 'text',
            value: 'Alpha',
            position: {
              start: {line: 1, column: 5, offset: 4},
              end: {line: 1, column: 10, offset: 9}
            }
          }
        ],
        position: {
          start: {line: 1, column: 1, offset: 0},
          end: {line: 1, column: 10, offset: 9}
        }
      })
    ),
    json(expected),
    'should transform positions'
  )
})

test('svg', () => {
  const expectedSvgInHtml = parseFragment(
    [
      '<svg width="230" height="120" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">',
      '<circle cx="60"  cy="60" r="50" fill="red"/>',
      '<circle cx="170" cy="60" r="50" fill="green"/>',
      '</svg>'
    ].join('')
  ).childNodes[0]
  // @ts-expect-error: p5 wants `null`.
  expectedSvgInHtml.parentNode = undefined

  assert.deepEqual(
    json(
      toParse5({
        type: 'element',
        tagName: 'svg',
        properties: {
          width: '230',
          height: '120',
          xmlns: 'http://www.w3.org/2000/svg',
          'xmlns:xlink': 'http://www.w3.org/1999/xlink'
        },
        children: [
          {
            type: 'element',
            tagName: 'circle',
            properties: {cx: '60', cy: '60', r: '50', fill: 'red'},
            children: []
          },
          {
            type: 'element',
            tagName: 'circle',
            properties: {cx: '170', cy: '60', r: '50', fill: 'green'},
            children: []
          }
        ]
      })
    ),
    json(expectedSvgInHtml),
    'should transform SVG in HTML'
  )

  const expectedSvg = parseFragment(
    '<svg><circle cx="60"  cy="60" r="50" fill="red"/></svg>'
  ).childNodes[0]
  assert(expectedSvg && 'childNodes' in expectedSvg)
  const expectedSvgChild = expectedSvg.childNodes[0]
  // @ts-expect-error: p5 wants `null`.
  expectedSvgChild.parentNode = undefined

  assert.deepEqual(
    json(
      toParse5(
        {
          type: 'element',
          tagName: 'circle',
          properties: {cx: '60', cy: '60', r: '50', fill: 'red'},
          children: []
        },
        'svg'
      )
    ),
    json(expectedSvgChild),
    'should transform SVG (given a space)'
  )

  const expectedSvgOptions = parseFragment(
    '<svg><circle cx="60"  cy="60" r="50" fill="red"/></svg>'
  ).childNodes[0]
  assert(expectedSvgOptions && 'childNodes' in expectedSvg)
  const expectedSvgOptionsChild = expectedSvg.childNodes[0]
  // @ts-expect-error: p5 wants `null`.
  expectedSvgChild.parentNode = undefined

  assert.deepEqual(
    json(
      toParse5(
        {
          type: 'element',
          tagName: 'circle',
          properties: {cx: '60', cy: '60', r: '50', fill: 'red'},
          children: []
        },
        {space: 'svg'}
      )
    ),
    json(expectedSvgOptionsChild),
    'should transform SVG (given options)'
  )
})

/**
 * @param {unknown} value
 * @returns {unknown}
 */
export function json(value) {
  return JSON.parse(stringify(value))
}
