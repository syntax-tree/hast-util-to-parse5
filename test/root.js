'use strict'

var test = require('tape')
var parse5 = require('parse5')
var json = require('./json')
var toParse5 = require('..')

test('root', function(t) {
  t.test('should transform a root (quirks)', function(st) {
    var expected = parse5.parse('')

    st.deepEqual(
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
      json(expected)
    )

    st.end()
  })

  t.test('should transform a root (no-quirks)', function(st) {
    var expected = parse5.parse('<!doctypehtml>')

    st.deepEqual(
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
      json(expected)
    )

    st.end()
  })

  t.end()
})
