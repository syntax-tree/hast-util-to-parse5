import test from 'tape'
import parse5 from 'parse5'
import {json} from './json.js'
import {toParse5} from '../index.js'

test('svg', function (t) {
  t.test('should transform SVG in HTML', function (st) {
    var actual = toParse5({
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

    var expected = parse5.parseFragment(
      [
        '<svg width="230" height="120" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">',
        '<circle cx="60"  cy="60" r="50" fill="red"/>',
        '<circle cx="170" cy="60" r="50" fill="green"/>',
        '</svg>'
      ].join('')
    ).childNodes[0]

    delete expected.parentNode

    st.deepEqual(json(actual), json(expected))

    st.end()
  })
  t.test('should transform SVG', function (st) {
    var actual = toParse5(
      {
        type: 'element',
        tagName: 'circle',
        properties: {cx: '60', cy: '60', r: '50', fill: 'red'},
        children: []
      },
      'svg'
    )

    var expected = parse5.parseFragment(
      '<svg><circle cx="60"  cy="60" r="50" fill="red"/></svg>'
      // @ts-ignore runtime.
    ).childNodes[0].childNodes[0]

    delete expected.parentNode

    st.deepEqual(json(actual), json(expected))

    st.end()
  })

  t.end()
})
