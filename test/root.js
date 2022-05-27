import test from 'tape'
import {parse} from 'parse5'
import {toParse5} from '../index.js'
import {json} from './json.js'

test('root', (t) => {
  t.test('should transform a root (quirks)', (st) => {
    const expected = parse('')

    st.deepEqual(
      json(
        toParse5({
          type: 'root',
          data: {quirksMode: true},
          children: [
            {
              type: 'element',
              tagName: 'html',
              children: [
                {type: 'element', tagName: 'head', children: []},
                {type: 'element', tagName: 'body', children: []}
              ]
            }
          ]
        })
      ),
      json(expected)
    )

    st.end()
  })

  t.test('should transform a root (no-quirks)', (st) => {
    const expected = parse('<!doctypehtml>')

    st.deepEqual(
      json(
        toParse5({
          type: 'root',
          children: [
            {type: 'doctype', name: 'html'},
            {
              type: 'element',
              tagName: 'html',
              children: [
                {type: 'element', tagName: 'head', children: []},
                {type: 'element', tagName: 'body', children: []}
              ]
            }
          ]
        })
      ),
      json(expected)
    )

    st.end()
  })

  t.end()
})
