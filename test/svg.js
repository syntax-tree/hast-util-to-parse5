import test from 'tape'
import {parseFragment} from 'parse5'
import {toParse5} from '../index.js'
import {json} from './json.js'

test('svg', (t) => {
  t.test('should transform SVG in HTML', (st) => {
    const actual = toParse5({
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

    const expected = parseFragment(
      [
        '<svg width="230" height="120" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">',
        '<circle cx="60"  cy="60" r="50" fill="red"/>',
        '<circle cx="170" cy="60" r="50" fill="green"/>',
        '</svg>'
      ].join('')
    ).childNodes[0]

    Object.assign(expected, {parentNode: undefined})

    st.deepEqual(json(actual), json(expected))

    st.end()
  })
  t.test('should transform SVG', (st) => {
    const actual = toParse5(
      {
        type: 'element',
        tagName: 'circle',
        properties: {cx: '60', cy: '60', r: '50', fill: 'red'},
        children: []
      },
      'svg'
    )

    const expected = parseFragment(
      '<svg><circle cx="60"  cy="60" r="50" fill="red"/></svg>'
      // @ts-expect-error runtime.
    ).childNodes[0].childNodes[0]

    delete expected.parentNode

    st.deepEqual(json(actual), json(expected))

    st.end()
  })

  t.end()
})
