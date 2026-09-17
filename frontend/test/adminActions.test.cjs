const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { buildSync } = require('esbuild');
const filename = path.resolve(__dirname, 'rowActions.cjs');
const compiled = buildSync({ entryPoints: [path.resolve(__dirname, '../src/components/admin/DataTable.tsx')], bundle: true, write: false, platform: 'node', format: 'cjs', jsx: 'automatic', external: ['react', 'react/jsx-runtime', 'react-dom', 'react-router-dom', 'lucide-react'] }).outputFiles[0].text;
const fixture = new Module(filename, module); fixture.filename = filename; fixture.paths = Module._nodeModulePaths(__dirname); fixture._compile(compiled, filename);
test('admin row actions show a single three-dot button, not separate action buttons', () => {
  const html = renderToStaticMarkup(React.createElement(fixture.exports.RowActions, { onView() {}, onEdit() {}, onDelete() {}, extra: React.createElement('button', null, 'Publish') }));
  assert.equal((html.match(/<button/g) || []).length, 1);
  assert.match(html, /aria-haspopup="menu"/);
  assert.match(html, /aria-expanded="false"/);
  assert.doesNotMatch(html, /Publish|aria-label="Delete"|aria-label="Edit"|aria-label="View"/);
});
