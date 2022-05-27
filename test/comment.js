import test from 'tape'
import {parseFragment} from 'parse5'
import {toParse5} from '../index.js'

test('comment', (t) => {
  const actual = toParse5({type: 'comment', value: 'Alpha'})
  const expected = parseFragment('<!--Alpha-->').childNodes[0]

  Object.assign(expected, {parentNode: undefined})

  t.deepEqual(actual, expected, 'should transform comments')

  t.end()
})
