'use strict'

var test = require('tape')
var parse5 = require('parse5')
var toParse5 = require('..')

test('doctype', function(t) {
  var node = parse5.parse(
    '<!DOCTYPE html SYSTEM "http://www.ibm.com/data/dtd/v11/ibmxhtml1-transitional.dtd">'
  )

  node = node.childNodes[0]
  delete node.parentNode

  t.deepEqual(
    toParse5({
      type: 'doctype',
      name: 'html',
      system: 'http://www.ibm.com/data/dtd/v11/ibmxhtml1-transitional.dtd'
    }),
    node,
    'should transform a doctype (legacy)'
  )

  node = parse5.parse('<!doctype html>')

  node = node.childNodes[0]
  delete node.parentNode

  t.deepEqual(
    toParse5({
      type: 'doctype',
      name: 'html'
    }),
    node,
    'should transform a doctype (modern)'
  )

  t.end()
})
