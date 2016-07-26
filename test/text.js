/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module hast-util-to-parse5
 * @fileoverview Test suite for `hast-util-to-parse5`.
 */

'use strict';

/* Dependencies. */
var test = require('tape');
var parse5 = require('parse5');
var toParse5 = require('..');

/* Tests. */
test('text', function (t) {
  var node = parse5.parseFragment('Alpha');

  node = node.childNodes[0];
  delete node.parentNode;

  t.deepEqual(
    toParse5({
      type: 'text',
      value: 'Alpha'
    }),
    node,
    'should transform text'
  );

  t.end();
});
