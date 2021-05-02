import test from 'tape'
import parse5 from 'parse5'
import {toParse5} from '../index.js'

test('comment', function (t) {
  var actual = toParse5({type: 'comment', value: 'Alpha'})
  var expected = parse5.parseFragment('<!--Alpha-->').childNodes[0]

  delete expected.parentNode

  t.deepEqual(actual, expected, 'should transform comments')

  t.end()
})
