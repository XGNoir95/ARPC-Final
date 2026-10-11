import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../src');
const stylesheets = [];
function scan(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) scan(file);
    else if (/\.(?:css|scss|sass|less)$/.test(entry.name)) stylesheets.push(relative(sourceRoot, file));
  }
}
scan(sourceRoot);
assert.deepEqual(stylesheets, ['index.css'], 'Use Tailwind utilities instead of component stylesheets.');

const css = readFileSync(join(sourceRoot, 'index.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
assert.match(css, /@import\s+["']tailwindcss["'];/, 'The global stylesheet must load Tailwind.');

// Read top-level blocks without being confused by URLs, strings or nested keyframes.
function blocks(source) {
  const result = [];
  let start = 0;
  let depth = 0;
  let quote = '';
  let header;
  let bodyStart;
  for (let index = 0; index < source.length; index++) {
    const character = source[index];
    if (quote) {
      if (character === '\\') index++;
      else if (character === quote) quote = '';
      continue;
    }
    if (character === '"' || character === "'") { quote = character; continue; }
    if (character === '{') {
      if (depth++ === 0) { header = source.slice(start, index).trim(); bodyStart = index + 1; }
    } else if (character === '}') {
      assert.ok(depth > 0, 'Unbalanced global stylesheet.');
      if (--depth === 0) { result.push({ header, body: source.slice(bodyStart, index) }); start = index + 1; }
    } else if (character === ';' && depth === 0) {
      result.push({ header: source.slice(start, index + 1).trim(), body: null });
      start = index + 1;
    }
  }
  assert.equal(depth, 0, 'Unbalanced global stylesheet.');
  assert.equal(source.slice(start).trim(), '', 'Unexpected global stylesheet content.');
  return result;
}
for (const { header, body } of blocks(css)) {
  if (/^@import\s+["']tailwindcss["'];$/.test(header)) continue;
  if (header === '@font-face' || header === '@theme' || /^@keyframes\s+[\w-]+$/.test(header)) continue;
  if (header === '@layer base') {
    for (const block of blocks(body)) {
      assert.equal(block.header, 'html', 'Component selectors belong in Tailwind utilities.');
      assert.match(block.body, /^\s*@apply\s+[^;]+;\s*$/, 'Use Tailwind utilities for document defaults.');
    }
    continue;
  }
  assert.fail(`Move ${header} from index.css to Tailwind utilities.`);
}
console.log('Tailwind styling policy verified: one global entry point, no component stylesheets.');
