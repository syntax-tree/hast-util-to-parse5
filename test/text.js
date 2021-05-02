import test from 'tape'
import parse5 from 'parse5'
import {toParse5} from '../index.js'

test('text', function (t) {
  var expected = parse5.parseFragment('Alpha').childNodes[0]

  delete expected.parentNode

  t.deepEqual(
    toParse5({type: 'text', value: 'Alpha'}),
    expected,
    'should transform text'
  )

  t.end()
})
