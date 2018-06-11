'use strict'

var test = require('tape')
var parse5 = require('parse5')
var toParse5 = require('..')

test('comment', function(t) {
  var node = parse5.parseFragment('<!--Alpha-->')

  node = node.childNodes[0]
  delete node.parentNode

  t.deepEqual(
    toParse5({
      type: 'comment',
      value: 'Alpha'
    }),
    node,
    'should transform comments'
  )

  t.end()
})
