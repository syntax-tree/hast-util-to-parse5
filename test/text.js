'use strict'

var test = require('tape')
var parse5 = require('parse5')
var toParse5 = require('..')

test('text', function(t) {
  var expected = parse5.parseFragment('Alpha').childNodes[0]

  delete expected.parentNode

  t.deepEqual(
    toParse5({type: 'text', value: 'Alpha'}),
    expected,
    'should transform text'
  )

  t.end()
})
