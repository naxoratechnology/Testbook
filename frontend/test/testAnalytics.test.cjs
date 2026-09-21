const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
const { buildSync } = require('esbuild');
const filename = path.resolve(__dirname, 'testAnalytics.cjs');
const compiled = buildSync({ entryPoints: [path.resolve(__dirname, '../src/components/tests/TestAnalytics.tsx')], bundle: true, write: false, platform: 'node', format: 'cjs', jsx: 'automatic', external: ['react', 'react/jsx-runtime', 'react-router-dom', 'lucide-react'] }).outputFiles[0].text;
const fixture = new Module(filename, module); fixture.filename = filename; fixture.paths = Module._nodeModulePaths(__dirname); fixture._compile(compiled, filename);
const { analyticsFor } = fixture.exports;

test('analytics counts attempted questions and uses attempted answers for accuracy', () => {
  assert.deepEqual(analyticsFor({ score: 3.5, totalMarks: 10, correct: 4, incorrect: 1, unanswered: 5 }), { attempted: 5, total: 10, accuracy: 80 });
});
test('unattempted test has zero accuracy without dividing by zero', () => {
  assert.deepEqual(analyticsFor({ score: 0, totalMarks: 10, correct: 0, incorrect: 0, unanswered: 10 }), { attempted: 0, total: 10, accuracy: 0 });
});
