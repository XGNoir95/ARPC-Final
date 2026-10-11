import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

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
const generatedClasses = new Set();
for (const file of stylesheets) {
  const css = readFileSync(join(outputDirectory, 'assets', file), 'utf8');
  for (const match of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) verifyUrl(match[1]);
  // Decode escaped CSS class selectors, including arbitrary Tailwind variants.
  for (const match of css.matchAll(/\.((?:\\[0-9a-fA-F]{1,6}\s?|\\.|[\w-])+)/g)) {
    generatedClasses.add(match[1]
      .replace(/\\([0-9a-fA-F]{1,6})\s?/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
      .replace(/\\(.)/g, '$1'));
  }
}

const utilityModules = [];
const scanSource = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) scanSource(path);
    else if (/\.(?:js|jsx|css)$/.test(entry.name) && !entry.name.includes('.test.')) {
      if (entry.name.endsWith('.styles.js')) utilityModules.push(path);
      const source = readFileSync(path, 'utf8');
      for (const match of source.matchAll(/["'](\/[^"'<>\\]+\.(?:png|jpe?g|svg|ttf))["']/g)) {
        assert.ok(existsSync(join(outputDirectory, match[1].slice(1))), `Public asset was not packaged: ${match[1]}`);
      }
      assert.ok(!/src=["']\/[^"']+\.(?:png|jpe?g|svg)/.test(source), `Root-relative image URL must use publicAsset(): ${path}`);
    }
  }
};
scanSource(resolve('src'));
let utilityCount = 0;
for (const file of utilityModules) {
  const exports = await import(pathToFileURL(file).href);
  for (const value of Object.values(exports)) {
    // Object keys are semantic hooks. Only the attached utilities need CSS rules.
    const markers = new Set(typeof value === 'object' && value !== null ? Object.keys(value) : ['route-skeleton']);
    const entries = typeof value === 'string' ? [value] : typeof value === 'object' && value !== null ? Object.values(value) : [];
    for (const entry of entries) {
      if (typeof entry !== 'string') continue;
      for (const utility of entry.split(/\s+/).filter(Boolean)) {
        if (markers.has(utility)) continue;
        assert.ok(generatedClasses.has(utility), `Tailwind did not generate ${utility} from ${file}. Keep complete utility strings and use String.raw for escaped selector underscores.`);
        utilityCount++;
      }
    }
  }
}
console.log(`Production artifact verified: HTML, CSS, fonts, and local images under ${base}`);
console.log(`Tailwind bundle verified: ${utilityCount} utility references from ${utilityModules.length} style modules.`);
