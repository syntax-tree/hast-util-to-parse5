import test from 'tape'
import {parseFragment} from 'parse5'
import {toParse5} from '../index.js'

test('text', (t) => {
  const expected = parseFragment('Alpha').childNodes[0]

  Object.assign(expected, {parentNode: undefined})

  t.deepEqual(
    toParse5({type: 'text', value: 'Alpha'}),
    expected,
    'should transform text'
  )

  t.end()
})
