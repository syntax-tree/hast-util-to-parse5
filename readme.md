# hast-util-to-parse5

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[hast][] utility to generate [`parse5`][parse5]s [AST][].

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`toParse5(tree[, space])`](#toparse5tree-space)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a utility that can turn a hast syntax tree into `parse5`s AST.
Why not use a Parse5 adapter, you might ask?
Well, because it’s more code weight to use adapters, and more fragile.

## When should I use this?

This package is useful when working with `parse5`, and for some reason want to
generate its AST again.
The inverse utility, [`hast-util-from-parse5`][hast-util-from-parse5], is more
likely what you want.

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, 16.0+, or 18.0+), install with [npm][]:

```sh
npm install hast-util-to-parse5
```

In Deno with [`esm.sh`][esmsh]:

```js
import {toParse5} from 'https://esm.sh/hast-util-to-parse5@7'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {toParse5} from 'https://esm.sh/hast-util-to-parse5@7?bundle'
</script>
```

## Use

```js
import {toParse5} from 'hast-util-to-parse5'

const tree = toParse5({
  type: 'element',
  tagName: 'h1',
  properties: {},
  children: [{type: 'text', value: 'World!'}]
})

console.log(tree)
```

Yields:

```js
{ nodeName: 'h1',
  tagName: 'h1',
  attrs: [],
  namespaceURI: 'http://www.w3.org/1999/xhtml',
  childNodes: [ { nodeName: '#text', value: 'World!', parentNode: [Circular] } ] }
```

## API

This package exports the identifier `toParse5`.
There is no default export.

### `toParse5(tree[, space])`

[hast][] utility to transform to [`parse5`][parse5]s [ast][].

###### `space`

Whether the root of the given tree is in the HTML or SVG space (enum, `'svg'` or
`'html'`, default: `'html'`).

If an `svg` element is found in the HTML space, `toParse5` automatically
switches to the SVG space when entering the element, and switches back when
exiting.

## Types

This package is fully typed with [TypeScript][].
It exports the additional type `Space`.

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, 16.0+, and 18.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

## Security

Use of `hast-util-to-parse5` can open you up to a
[cross-site scripting (XSS)][xss] attack if the hast tree is unsafe.

## Related

*   [`hast-util-from-parse5`](https://github.com/syntax-tree/hast-util-from-parse5)
    — transform from Parse5’s AST to hast
*   [`hast-util-to-nlcst`](https://github.com/syntax-tree/hast-util-to-nlcst)
    — transform hast to nlcst
*   [`hast-util-to-mdast`](https://github.com/syntax-tree/hast-util-to-mdast)
    — transform hast to mdast
*   [`hast-util-to-xast`](https://github.com/syntax-tree/hast-util-to-xast)
    — transform hast to xast
*   [`mdast-util-to-hast`](https://github.com/syntax-tree/mdast-util-to-hast)
    — transform mdast to hast
*   [`mdast-util-to-nlcst`](https://github.com/syntax-tree/mdast-util-to-nlcst)
    — transform mdast to nlcst

## Contribute

See [`contributing.md`][contributing] in [`syntax-tree/.github`][health] for
ways to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/syntax-tree/hast-util-to-parse5/workflows/main/badge.svg

[build]: https://github.com/syntax-tree/hast-util-to-parse5/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/syntax-tree/hast-util-to-parse5.svg

[coverage]: https://codecov.io/github/syntax-tree/hast-util-to-parse5

[downloads-badge]: https://img.shields.io/npm/dm/hast-util-to-parse5.svg

[downloads]: https://www.npmjs.com/package/hast-util-to-parse5

[size-badge]: https://img.shields.io/bundlephobia/minzip/hast-util-to-parse5.svg

[size]: https://bundlephobia.com/result?p=hast-util-to-parse5

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/syntax-tree/unist/discussions

[npm]: https://docs.npmjs.com/cli/install

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[typescript]: https://www.typescriptlang.org

[license]: license

[author]: https://wooorm.com

[health]: https://github.com/syntax-tree/.github

[contributing]: https://github.com/syntax-tree/.github/blob/main/contributing.md

[support]: https://github.com/syntax-tree/.github/blob/main/support.md

[coc]: https://github.com/syntax-tree/.github/blob/main/code-of-conduct.md

[hast]: https://github.com/syntax-tree/hast

[xss]: https://en.wikipedia.org/wiki/Cross-site_scripting

[parse5]: https://github.com/inikulin/parse5

[ast]: https://github.com/inikulin/parse5/wiki/Documentation

[hast-util-from-parse5]: https://github.com/syntax-tree/hast-util-from-parse5
