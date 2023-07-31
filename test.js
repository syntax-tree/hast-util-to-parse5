import assert from 'node:assert/strict'
import test from 'node:test'
import stringify from 'json-stringify-safe'
import {parse, parseFragment} from 'parse5'
import {toParse5} from './index.js'

test('toParse5', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('./index.js')).sort(), [
      'toParse5'
    ])
  })

  await t.test('should transform a root (no-quirks)', async function () {
    assert.deepEqual(
      json(
        toParse5({
          type: 'root',
          children: [
            {type: 'doctype'},
            {
              type: 'element',
              tagName: 'html',
              properties: {},
              children: [
                {
                  type: 'element',
                  tagName: 'head',
                  properties: {},
                  children: []
                },
                {
                  type: 'element',
                  tagName: 'body',
                  properties: {},
                  children: []
                }
              ]
            }
          ]
        })
      ),
      json(parse('<!doctypehtml>'))
    )
  })
})

test('root', async function (t) {
  await t.test('should transform a root (quirks)', async function () {
    assert.deepEqual(
      json(
        toParse5({
          type: 'root',
          data: {quirksMode: true},
          children: [
            {
              type: 'element',
              tagName: 'html',
              properties: {},
              children: [
                {
                  type: 'element',
                  tagName: 'head',
                  properties: {},
                  children: []
                },
                {
                  type: 'element',
                  tagName: 'body',
                  properties: {},
                  children: []
                }
              ]
            }
          ]
        })
      ),
      json(parse(''))
    )
  })

  await t.test('should transform a root (no-quirks)', async function () {
    assert.deepEqual(
      json(
        toParse5({
          type: 'root',
          children: [
            {type: 'doctype'},
            {
              type: 'element',
              tagName: 'html',
              properties: {},
              children: [
                {
                  type: 'element',
                  tagName: 'head',
                  properties: {},
                  children: []
                },
                {
                  type: 'element',
                  tagName: 'body',
                  properties: {},
                  children: []
                }
              ]
            }
          ]
        })
      ),
      json(parse('<!doctypehtml>'))
    )
  })
})

test('doctype', async function (t) {
  await t.test('should transform a doctype (modern)', async function () {
    const expected = parse('<!doctypehtml>').childNodes[0]
    expected.parentNode = null

    assert.deepEqual(toParse5({type: 'doctype'}), expected)
  })
})

test('text', async function (t) {
  await t.test('should transform text', async function () {
    const expected = parseFragment('Alpha').childNodes[0]
    expected.parentNode = null

    assert.deepEqual(toParse5({type: 'text', value: 'Alpha'}), expected)
  })
})

test('comment', async function (t) {
  await t.test('should transform comments', async function () {
    const expected = parseFragment('<!--Alpha-->').childNodes[0]
    expected.parentNode = null

    assert.deepEqual(toParse5({type: 'comment', value: 'Alpha'}), expected)
  })
})

test('element', async function (t) {
  await t.test('should transform elements', async function () {
    const expected = parseFragment('<h1>Alpha').childNodes[0]
    expected.parentNode = null

    assert.deepEqual(
      json(
        toParse5({
          type: 'element',
          tagName: 'h1',
          properties: {},
          children: [{type: 'text', value: 'Alpha'}]
        })
      ),
      json(expected)
    )
  })

  await t.test('should support attributes', async function () {
    const expected = parseFragment(
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
    expected.parentNode = null

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
      json(expected)
    )
  })

  await t.test('should transform void elements', async function () {
    const expected = parseFragment('<img src=# alt="">').childNodes[0]
    expected.parentNode = null

    assert.deepEqual(
      json(
        toParse5({
          type: 'element',
          tagName: 'img',
          properties: {src: '#', alt: ''},
          children: []
        })
      ),
      json(expected)
    )
  })

  await t.test('should transform templates with elements', async function () {
    const expected = parseFragment('<template id="a">Alpha</template>')
      .childNodes[0]
    expected.parentNode = null

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
      json(expected)
    )
  })

  await t.test('should transform templates with text', async function () {
    const expected = parseFragment(
      '<template id="b"><b>bold</b> and <i>italic</i></template>'
    ).childNodes[0]
    expected.parentNode = null

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
                properties: {},
                children: [{type: 'text', value: 'bold'}]
              },
              {type: 'text', value: ' and '},
              {
                type: 'element',
                tagName: 'i',
                properties: {},
                children: [{type: 'text', value: 'italic'}]
              }
            ]
          },
          children: []
        })
      ),
      json(expected)
    )
  })
})

test('position', async function (t) {
  await t.test('should transform positions', async function () {
    const expected = parseFragment('<h1>Alpha', {
      sourceCodeLocationInfo: true
    }).childNodes[0]
    expected.parentNode = null

    assert(expected.sourceCodeLocation, 'expected position')
    assert('startTag' in expected.sourceCodeLocation, 'expected position')
    delete expected.sourceCodeLocation.startTag

    assert.deepEqual(
      json(
        toParse5({
          type: 'element',
          tagName: 'h1',
          properties: {},
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
      json(expected)
    )
  })
})

test('svg', async function (t) {
  await t.test('should transform SVG in HTML', async function () {
    const expected = parseFragment(
      [
        '<svg width="230" height="120" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">',
        '<circle cx="60"  cy="60" r="50" fill="red"/>',
        '<circle cx="170" cy="60" r="50" fill="green"/>',
        '</svg>'
      ].join('')
    ).childNodes[0]
    expected.parentNode = null

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
      json(expected)
    )
  })

  await t.test('should transform SVG (given options)', async function () {
    const expected = parseFragment(
      '<svg><circle cx="60"  cy="60" r="50" fill="red"/></svg>'
    ).childNodes[0]
    assert(expected && 'childNodes' in expected)
    const expectedChild = expected.childNodes[0]
    expectedChild.parentNode = null

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
      json(expectedChild)
    )
  })
})

/**
 * @param {unknown} value
 * @returns {unknown}
 */
export function json(value) {
  return JSON.parse(stringify(value))
}
