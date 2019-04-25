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

  t.test('should transform attributes', function(st) {
    var actual = toParse5({
      type: 'element',
      tagName: 'div',
      properties: {},
      children: [
        {
          type: 'element',
          tagName: 'h1',
          properties: {id: 'a', className: ['b', 'c'], hidden: true, height: 2},
          children: [
            {type: 'text', value: 'alpha '},
            {
              type: 'element',
              tagName: 'strong',
              properties: {
                style: 'color:red;',
                // Unknown booleans are ignored.
                ignored: false,
                // Falsey known booleans are ignored.
                disabled: 0,
                // Unknown props are left as-is.
                foo: 'bar',
                // Unknown lists are space-separated.
                // Note: you’d expect `camelCase` here, but p5 lowercases
                // attributes on HTML, so it drops the camelcase.
                camelcase: ['on', 'off'],
                // Numeric-start data properties.
                data123: '456',
                // Data properties.
                dataSome: 'yes',
                // ARIA props.
                ariaValuenow: '1'
              },
              children: [{type: 'text', value: 'bravo'}]
            },
            {type: 'text', value: ' charlie'}
          ]
        },
        {
          type: 'element',
          tagName: 'input',
          properties: {
            checked: true,
            type: 'file',
            // Known comma-separated lists:
            accept: ['.jpg', '.jpeg']
          },
          children: []
        }
      ]
    })

    var expected = parse5.parseFragment(
      [
        '<div>',
        '<h1 id="a" class="b c" hidden height="2">',
        'alpha ',
        '<strong style="color:red;" foo="bar" camelCase="on off" data-123="456" data-some="yes" aria-valuenow="1">',
        'bravo',
        '</strong>',
        ' charlie',
        '</h1>',
        '<input checked type="file" accept=".jpg, .jpeg">',
        '</div>'
      ].join('')
    ).childNodes[0]

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
