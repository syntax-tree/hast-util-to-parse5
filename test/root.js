'use strict'

var test = require('tape')
var parse5 = require('parse5')
var toParse5 = require('..')

test('root', function(t) {
  var ast = parse5.parse('')

  ast.childNodes = []

  t.deepEqual(
    toParse5({
      type: 'root',
      data: {quirksMode: true},
      children: []
    }),
    ast,
    'should transform a root (quirksMode)'
  )

  ast.mode = 'no-quirks'

  t.deepEqual(
    toParse5({
      type: 'root',
      children: []
    }),
    ast,
    'should transform a root (non-quirksMode)'
  )

  t.end()
})
