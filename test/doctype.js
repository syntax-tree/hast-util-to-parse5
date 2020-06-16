'use strict'

var test = require('tape')
var parse5 = require('parse5')
var toParse5 = require('..')

test('doctype', function (t) {
  t.test('should transform a doctype (legacy)', function (st) {
    var actual = toParse5({
      type: 'doctype',
      name: 'html',
      system: 'http://www.ibm.com/data/dtd/v11/ibmxhtml1-transitional.dtd'
    })
    var expected = parse5.parse(
      '<!DOCTYPE html SYSTEM "http://www.ibm.com/data/dtd/v11/ibmxhtml1-transitional.dtd">'
    ).childNodes[0]

    delete expected.parentNode

    st.deepEqual(actual, expected)

    st.end()
  })

  t.test('should transform a doctype (modern)', function (st) {
    var actual = toParse5({type: 'doctype', name: 'html'})
    var expected = parse5.parse('<!doctypehtml>').childNodes[0]

    delete expected.parentNode

    st.deepEqual(actual, expected)

    st.end()
  })

  t.end()
})
