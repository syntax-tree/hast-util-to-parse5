import test from 'tape'
import parse5 from 'parse5'
import {toParse5} from '../index.js'

test('comment', (t) => {
  const actual = toParse5({type: 'comment', value: 'Alpha'})
  const expected = parse5.parseFragment('<!--Alpha-->').childNodes[0]

  expected.parentNode = undefined

  t.deepEqual(actual, expected, 'should transform comments')

  t.end()
})
