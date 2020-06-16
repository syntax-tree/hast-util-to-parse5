'use strict'

var test = require('tape')
var parse5 = require('parse5')
var toParse5 = require('..')

test('comment', function (t) {
  var actual = toParse5({type: 'comment', value: 'Alpha'})
  var expected = parse5.parseFragment('<!--Alpha-->').childNodes[0]

  delete expected.parentNode

  t.deepEqual(actual, expected, 'should transform comments')

  t.end()
})
