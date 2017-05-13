'use strict';

var inspect = require('util').inspect;
var test = require('tape');
var parse5 = require('parse5');
var toParse5 = require('..');

test('position', function (t) {
  var node = parse5.parseFragment('<h1>Alpha', {locationInfo: true});

  node = node.childNodes[0];
  delete node.parentNode;
  delete node.__location.startTag;

  t.deepEqual(
    inspect(toParse5({
      type: 'element',
      tagName: 'h1',
      children: [{
        type: 'text',
        value: 'Alpha',
        position: {
          start: {line: 1, column: 5, offset: 4},
          end: {line: 1, column: 10, offset: 9}
        }
      }],
      position: {
        start: {line: 1, column: 1, offset: 0},
        end: {line: 1, column: 10, offset: 9}
      }
    }), {depth: null}),
    inspect(node, {depth: null}),
    'should transform positions'
  );

  t.end();
});
