'use strict';

/* Dependencies. */
var inspect = require('util').inspect;
var test = require('tape');
var parse5 = require('parse5');
var toParse5 = require('..');

/* Tests. */
test('element', function (t) {
  var node = parse5.parseFragment('<h1>Alpha');

  node = node.childNodes[0];
  delete node.parentNode;

  t.deepEqual(
    inspect(toParse5({
      type: 'element',
      tagName: 'h1',
      children: [{
        type: 'text',
        value: 'Alpha'
      }]
    }), {depth: null}),
    inspect(node, {depth: null}),
    'should transform elements'
  );

  node = parse5.parseFragment('<img src=# alt="">');

  node = node.childNodes[0];
  delete node.parentNode;

  t.deepEqual(
    inspect(toParse5({
      type: 'element',
      tagName: 'img',
      properties: {
        src: '#',
        alt: ''
      }
    }), {depth: null}),
    inspect(node, {depth: null}),
    'should transform void elements'
  );

  node = parse5.parseFragment([
    '<svg width="230" height="120" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">',
    '<circle cx="60"  cy="60" r="50" fill="red"/>',
    '<circle cx="170" cy="60" r="50" fill="green"/>',
    '</svg>'
  ].join(''));

  node = node.childNodes[0];
  delete node.parentNode;

  t.deepEqual(
    inspect(toParse5({
      type: 'element',
      tagName: 'svg',
      properties: {
        width: '230',
        height: '120',
        xmlns: 'http://www.w3.org/2000/svg',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink'
      },
      children: [
        {
          type: 'element',
          tagName: 'circle',
          properties: {
            cx: '60',
            cy: '60',
            r: '50',
            fill: 'red'
          },
          children: []
        },
        {
          type: 'element',
          tagName: 'circle',
          properties: {
            cx: '170',
            cy: '60',
            r: '50',
            fill: 'green'
          },
          children: []
        }
      ]
    }), {depth: null}),
    inspect(node, {depth: null}),
    'should transform foreign elements'
  );

  t.end();
});
