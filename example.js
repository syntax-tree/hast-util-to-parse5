// Dependencies:
var toParse5 = require('./index.js');

// Fixture:
var ast = toParse5({
  type: 'element',
  tagName: 'h1',
  properties: {},
  children: [{type: 'text', value: 'World!'}]
});

// Yields:
console.log('js', require('util').inspect(ast));
