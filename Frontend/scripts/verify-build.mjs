import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import process from 'node:process';

const outputDirectory = resolve(process.env.BUILD_DIR || 'dist');
const base = process.env.VITE_BASE_PATH || '/';
const html = readFileSync(join(outputDirectory, 'index.html'), 'utf8');

const verifyUrl = (url) => {
  if (/^(?:https?:|data:|#|\/\/)/.test(url)) return;
  assert.ok(url.startsWith(base), `Asset is outside deployment base ${base}: ${url}`);
  const relativePath = decodeURIComponent(url.slice(base.length).split(/[?#]/)[0]);
  assert.ok(existsSync(join(outputDirectory, relativePath)), `Built asset is missing: ${url}`);
};

for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) verifyUrl(match[1]);
const stylesheets = readdirSync(join(outputDirectory, 'assets')).filter((file) => file.endsWith('.css'));
assert.ok(stylesheets.length > 0, 'No stylesheet was built');
for (const file of stylesheets) {
  const css = readFileSync(join(outputDirectory, 'assets', file), 'utf8');
  for (const match of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) verifyUrl(match[1]);
}

const scanSource = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) scanSource(path);
    else if (/\.(?:js|jsx|css)$/.test(entry.name) && !entry.name.includes('.test.')) {
      const source = readFileSync(path, 'utf8');
      for (const match of source.matchAll(/["'](\/[^"'<>\\]+\.(?:png|jpe?g|svg|ttf))["']/g)) {
        assert.ok(existsSync(join(outputDirectory, match[1].slice(1))), `Public asset was not packaged: ${match[1]}`);
      }
      assert.ok(!/src=["']\/[^"']+\.(?:png|jpe?g|svg)/.test(source), `Root-relative image URL must use publicAsset(): ${path}`);
    }
  }
};
scanSource(resolve('src'));
console.log(`Production artifact verified: HTML, CSS, fonts, and local images under ${base}`);
