import test from 'tape'
import {parse} from 'parse5'
import {toParse5} from '../index.js'

test('doctype', (t) => {
  t.test('should transform a doctype (legacy)', (st) => {
    const actual = toParse5({
      type: 'doctype',
      name: 'html',
      // @ts-expect-error legacy property is not recognized by @types/hast
      system: 'http://www.ibm.com/data/dtd/v11/ibmxhtml1-transitional.dtd'
    })
    const expected = parse('<!DOCTYPE html>').childNodes[0]

    Object.assign(expected, {parentNode: undefined})

    st.deepEqual(actual, expected)

    st.end()
  })

  t.test('should transform a doctype (modern)', (st) => {
    const actual = toParse5({type: 'doctype', name: 'html'})
    const expected = parse('<!doctypehtml>').childNodes[0]

    Object.assign(expected, {parentNode: undefined})

    st.deepEqual(actual, expected)

    st.end()
  })

  t.end()
})
