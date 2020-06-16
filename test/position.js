'use strict'

var test = require('tape')
var parse5 = require('parse5')
var json = require('./json')
var toParse5 = require('..')

test('position', function (t) {
  var actual = toParse5({
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

  var expected = parse5.parseFragment('<h1>Alpha', {
    sourceCodeLocationInfo: true
  }).childNodes[0]

  delete expected.parentNode

  // Not possible yet to map this one.
  delete expected.sourceCodeLocation.startTag

  t.deepEqual(json(actual), json(expected), 'should transform positions')

  t.end()
})
