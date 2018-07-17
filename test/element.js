'use strict'

var test = require('tape')
var parse5 = require('parse5')
var json = require('./json')
var toParse5 = require('..')

test('element', function(t) {
  t.test('should transform elements', function(st) {
    var actual = toParse5({
      type: 'element',
      tagName: 'h1',
      children: [{type: 'text', value: 'Alpha'}]
    })
    var expected = parse5.parseFragment('<h1>Alpha').childNodes[0]

    delete expected.parentNode

    st.deepEqual(json(actual), json(expected))

    st.end()
  })

  t.test('should transform void elements', function(st) {
    var actual = toParse5({
      type: 'element',
      tagName: 'img',
      properties: {src: '#', alt: ''}
    })
    var expected = parse5.parseFragment('<img src=# alt="">').childNodes[0]

    delete expected.parentNode

    st.deepEqual(json(actual), json(expected))

    st.end()
  })

  t.test('should transform templates with elements', function(st) {
    var actual = toParse5({
      type: 'element',
      tagName: 'template',
      properties: {id: 'a'},
      content: {
        type: 'root',
        children: [{type: 'text', value: 'Alpha'}]
      }
    })
    var expected = parse5.parseFragment('<template id="a">Alpha</template>')
      .childNodes[0]

    delete expected.parentNode

    st.deepEqual(json(actual), json(expected))

    st.end()
  })

  t.test('should transform templates with text', function(st) {
    var actual = toParse5({
      type: 'element',
      tagName: 'template',
      properties: {id: 'b'},
      content: {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'b',
            children: [{type: 'text', value: 'bold'}]
          },
          {type: 'text', value: ' and '},
          {
            type: 'element',
            tagName: 'i',
            children: [{type: 'text', value: 'italic'}]
          }
        ]
      }
    })

    var expected = parse5.parseFragment(
      '<template id="b"><b>bold</b> and <i>italic</i></template>'
    ).childNodes[0]

    delete expected.parentNode

    st.deepEqual(json(actual), json(expected))

    st.end()
  })

  t.end()
})
