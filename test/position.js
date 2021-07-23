import test from 'tape'
import parse5 from 'parse5'
import {json} from './json.js'
import {toParse5} from '../index.js'

test('position', (t) => {
  const actual = toParse5({
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

  const expected = parse5.parseFragment('<h1>Alpha', {
    sourceCodeLocationInfo: true
  }).childNodes[0]

  Object.assign(expected, {parentNode: undefined})

  // @ts-expect-error Types are wrong.
  // Not possible yet to map this one.
  delete expected.sourceCodeLocation.startTag

  t.deepEqual(json(actual), json(expected), 'should transform positions')

  t.end()
})
